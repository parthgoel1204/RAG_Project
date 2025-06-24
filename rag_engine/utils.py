# rag_engine/utils.py
import os
import pdfplumber


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from a PDF file."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def ensure_dir(directory: str):
    """Make directory if it doesn’t exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
