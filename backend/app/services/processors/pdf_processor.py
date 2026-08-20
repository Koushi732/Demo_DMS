import fitz  # PyMuPDF
import io
from .base import BaseProcessor

class PDFProcessor(BaseProcessor):
    def extract_text(self, file_content: bytes) -> str:
        text = ""
        try:
            with fitz.open("pdf", file_content) as doc:
                for page in doc:
                    text += page.get_text() + "\n"
        except Exception as e:
            print(f"PDF extraction error: {e}")
            raise e
        return text.strip()
