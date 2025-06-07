# rag_engine/chunker.py
import os
import argparse
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract raw text from a PDF using pdfplumber.
    """
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def split_into_chunks(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Use LangChain’s RecursiveCharacterTextSplitter to split `text` into 
    chunks of at most `chunk_size` characters, with `chunk_overlap` characters overlap.
    """
    splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", " ", ""],
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    # splitter.split_text returns a list of strings (each chunk)
    return splitter.split_text(text)

def main():
    parser = argparse.ArgumentParser(description="Chunk a PDF or text file.")
    parser.add_argument(
        "--filepath", 
        type=str, 
        required=True, 
        help="Path to the document (PDF or .txt)"
    )
    parser.add_argument(
        "--outdir", 
        type=str, 
        default="rag_engine/data/chunks", 
        help="Directory to save chunked .txt files"
    )
    args = parser.parse_args()

    # Ensure output directory exists
    os.makedirs(args.outdir, exist_ok=True)

    # 1. Read the entire document
    if args.filepath.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(args.filepath)
    else:
        with open(args.filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()

    # 2. Split into text chunks
    chunks = split_into_chunks(raw_text, chunk_size=1000, chunk_overlap=200)

    # 3. Save each chunk to a separate .txt file
    for idx, chunk in enumerate(chunks):
        chunk_filename = os.path.join(args.outdir, f"chunk_{idx}.txt")
        with open(chunk_filename, "w", encoding="utf-8") as cf:
            cf.write(chunk)

    print(f"Saved {len(chunks)} chunks to {args.outdir}")

if __name__ == "__main__":
    main()
