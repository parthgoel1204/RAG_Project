# rag_engine/embeddings.py
import os
import argparse
import numpy as np
from langchain_huggingface import HuggingFaceEmbeddings
from sentence_transformers import SentenceTransformer


def load_chunk_texts(chunks_dir: str):
    chunk_list = []
    for fname in sorted(os.listdir(chunks_dir)):
        if fname.endswith(".txt"):
            with open(os.path.join(chunks_dir, fname), "r", encoding="utf-8") as f:
                chunk_list.append((fname, f.read()))
    return chunk_list


def main():
    parser = argparse.ArgumentParser(description="Embed text chunks and save vectors.")
    parser.add_argument("--chunks_dir", type=str, default="rag_engine/data/chunks")
    parser.add_argument("--outdir", type=str, default="rag_engine/data")
    args = parser.parse_args()

    # 1. Load chunk texts
    chunks = load_chunk_texts(args.chunks_dir)

    # 2. Initialize the same model used for both indexing and querying:
    model = SentenceTransformer("all-MiniLM-L6-v2")  # dim = 384

    embeddings = []
    chunk_names = []
    for fname, text in chunks:
        vec = model.encode(text).astype("float32")
        embeddings.append(vec)
        chunk_names.append(fname)

    embeddings_array = np.vstack(embeddings)  # shape: (N_chunks, 384)
    chunk_names_array = np.array(chunk_names)

    os.makedirs(args.outdir, exist_ok=True)
    np.save(os.path.join(args.outdir, "embeddings.npy"), embeddings_array)
    np.save(os.path.join(args.outdir, "chunk_names.npy"), chunk_names_array)

    print(
        f"Saved {len(embeddings)} embeddings (dim=384) to {args.outdir}/embeddings.npy"
    )


if __name__ == "__main__":
    main()
