# rag_engine/document_ingestor.py
import os
import argparse
import subprocess
import sys

def run_subprocess(args_list, cwd=None):
    """
    Run a subprocess, wait for it to finish, capture stdout/stderr,
    and exit with an error if it fails.
    """
    proc = subprocess.Popen(
        args_list,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd  # By default, run in current working directory, but we can override
    )
    stdout, stderr = proc.communicate()
    if proc.returncode != 0:
        # If there's an error, print it and exit
        print(f"Error running `{ ' '.join(args_list) }`:\n{stderr}", file=sys.stderr)
        sys.exit(proc.returncode)
    return stdout.strip()

def main():
    parser = argparse.ArgumentParser(description="Full pipeline: chunk → embed → index")
    parser.add_argument(
        "--filepath", type=str, required=True, help="Path to the uploaded document"
    )
    args = parser.parse_args()

    # 1. Determine the directory where this script lives (rag_engine/)
    #    Then we can always refer to sibling scripts unambiguously.
    rag_engine_dir = os.path.dirname(os.path.abspath(__file__))

    # 2. Paths to each of the child scripts (all in rag_engine_dir)
    chunker_script = os.path.join(rag_engine_dir, "chunker.py")
    embeddings_script = os.path.join(rag_engine_dir, "embeddings.py")
    index_faiss_script = os.path.join(rag_engine_dir, "index_faiss.py")

    # 3. Decide where to put chunk files, embeddings, and index
    data_dir = os.path.join(rag_engine_dir, "data")
    chunks_dir = os.path.join(data_dir, "chunks")
    embeddings_path = os.path.join(data_dir, "embeddings.npy")
    chunk_names_path = os.path.join(data_dir, "chunk_names.npy")
    index_path = os.path.join(data_dir, "index.faiss")

    # 4. Create data directories if they don’t exist
    os.makedirs(chunks_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    # 5. Run chunker.py
    print("⏳ Running chunker.py …")
    run_subprocess(
        [sys.executable, chunker_script,
         "--filepath", args.filepath,
         "--outdir", chunks_dir],
        cwd=rag_engine_dir
    )

    # 6. Run embeddings.py
    print("⏳ Running embeddings.py …")
    run_subprocess(
        [sys.executable, embeddings_script,
         "--chunks_dir", chunks_dir,
         "--outdir", data_dir],
        cwd=rag_engine_dir
    )

    # 7. Run index_faiss.py
    print("⏳ Running index_faiss.py …")
    run_subprocess(
        [sys.executable, index_faiss_script,
         "--embeddings_path", embeddings_path,
         "--index_path", index_path],
        cwd=rag_engine_dir
    )

    print("✅ Document ingest complete (chunks, embeddings, FAISS index built).")

if __name__ == "__main__":
    main()
