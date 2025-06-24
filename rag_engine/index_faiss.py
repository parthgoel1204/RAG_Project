import os
import argparse
import numpy as np
import faiss


def main():
    parser = argparse.ArgumentParser(
        description="Build FAISS index from saved embeddings."
    )
    parser.add_argument(
        "--embeddings_path",
        type=str,
        default="rag_engine/data/embeddings.npy",
        help="Path to embeddings.npy",
    )
    parser.add_argument(
        "--index_path",
        type=str,
        default="rag_engine/data/index.faiss",
        help="Where to save the FAISS index",
    )
    args = parser.parse_args()

    # 1. Load embeddings
    emb = np.load(args.embeddings_path).astype("float32")
    num_vectors, dim = emb.shape

    # 2. Build a simple Flat (L2) index
    index = faiss.IndexFlatL2(dim)
    index.add(emb)

    # 3. Ensure the parent directory exists
    parent_dir = os.path.dirname(args.index_path)
    os.makedirs(parent_dir, exist_ok=True)

    # 4. Write index to disk
    faiss.write_index(index, args.index_path)
    print(f"Saved FAISS index with {num_vectors} vectors to {args.index_path}")


if __name__ == "__main__":
    main()
