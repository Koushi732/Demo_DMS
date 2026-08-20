import abc
from typing import Dict, Any

class BaseProcessor(abc.ABC):
    @abc.abstractmethod
    def extract_text(self, file_content: bytes) -> str:
        """Extract text from the document byte content."""
        pass

def get_processor_for_mime_type(mime_type: str) -> BaseProcessor:
    from .pdf_processor import PDFProcessor
    from .docx_processor import DOCXProcessor

    if mime_type == "application/pdf":
        return PDFProcessor()
    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return DOCXProcessor()
    
    raise ValueError(f"No processor found for MIME type: {mime_type}")
