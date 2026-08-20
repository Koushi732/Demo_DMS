import io
import docx
from .base import BaseProcessor

class DOCXProcessor(BaseProcessor):
    def extract_text(self, file_content: bytes) -> str:
        text = ""
        try:
            doc = docx.Document(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"DOCX extraction error: {e}")
            raise e
        return text.strip()
