import os
import argparse
import json
import numpy as np
import faiss
from langchain_huggingface import HuggingFaceEmbeddings
import requests


def load_faiss_index(index_path: str):
    if not os.path.exists(index_path):
        raise FileNotFoundError(f"FAISS index not found at {index_path}")
    return faiss.read_index(index_path)


def load_chunk_names(chunk_names_path: str):
    return np.load(chunk_names_path, allow_pickle=True)


def embed_query(query: str) -> np.ndarray:
    """
    Use LangChain’s HuggingFaceEmbeddings to produce a 1×D float32 vector.
    """
    hf = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vec = hf.embed_query(query)  # returns a Python list or np array
    return np.array(vec, dtype="float32").reshape(1, -1)


def retrieve_top_k(index, query_vec: np.ndarray, top_k: int):
    distances, indices = index.search(query_vec, top_k)
    return distances[0], indices[0]


def read_chunk_text(chunks_dir: str, chunk_filename: str):
    path = os.path.join(chunks_dir, chunk_filename)
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


def call_chatgroq(context: str, question: str, api_key: str):
    """
    Call the ChatGroq REST API to generate an answer given the `context` and `question`.
    Adjust the URL, headers, and payload according to ChatGroq’s documentation.
    """
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    # Build messages array: system + user
    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI assistant that answers questions based only on provided context. "
                "If the context does not contain the answer, say you don't know."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Context:\n\n{context}\n\n"
                f"Question: {question}\n\n"
                "Answer concisely (2-3 sentences) using only the context above."
            ),
        },
    ]

    payload = {
        "model": "deepseek-r1-distill-llama-70b",
        "messages": messages,
        "max_tokens": 256,
        "temperature": 0.4,
    }

    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    data = response.json()
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"].strip()
    else:
        return "Error: Unexpected response format from ChatGroq."


def main():
    parser = argparse.ArgumentParser(
        description="Search FAISS index and get an answer via ChatGroq."
    )
    parser.add_argument("--query", type=str, required=True, help="User’s search query")
    parser.add_argument(
        "--index_path",
        type=str,
        default="rag_engine/data/index.faiss",
        help="Path to FAISS index file",
    )
    parser.add_argument(
        "--chunk_names",
        type=str,
        default="rag_engine/data/chunk_names.npy",
        help="Path to numpy file containing chunk filenames",
    )
    parser.add_argument(
        "--chunks_dir",
        type=str,
        default="rag_engine/data/chunks",
        help="Directory where chunk_*.txt files are stored",
    )
    parser.add_argument(
        "--top_k", type=int, default=5, help="Number of top chunks to retrieve"
    )
    parser.add_argument("--api_key", type=str, required=True, help="ChatGroq API key")
    args = parser.parse_args()

    # 1. Load FAISS index & chunk names
    index = load_faiss_index(args.index_path)
    chunk_names = load_chunk_names(args.chunk_names)

    # 2. Embed the query & retrieve top_k
    query_vec = embed_query(args.query)
    distances, indices = retrieve_top_k(index, query_vec, args.top_k)

    # 3. Collect chunk text + metadata for top_k
    retrieved = []
    context_parts = []
    for score, idx in zip(distances, indices):
        chunk_filename = chunk_names[idx]
        if isinstance(chunk_filename, bytes):
            chunk_filename = chunk_filename.decode("utf-8")

        chunk_text = read_chunk_text(args.chunks_dir, chunk_filename)
        snippet = chunk_text[:500].replace("\n", " ") + "..."

        retrieved.append(
            {
                "chunk_filename": chunk_filename,
                "score": float(score),
                "snippet": snippet,
            }
        )
        context_parts.append(chunk_text)

    # 4. Build a single context string by concatenating top_k chunks
    context = "\n\n---\n\n".join(context_parts)

    # 5. Call ChatGroq with context + question
    try:
        answer = call_chatgroq(context, args.query, args.api_key)
    except Exception as e:
        answer = f"Error calling ChatGroq: {str(e)}"

    # 6. Print JSON to stdout so Node can capture it
    output = {"answer": answer, "sources": retrieved}
    print(json.dumps(output))


if __name__ == "__main__":
    main()
