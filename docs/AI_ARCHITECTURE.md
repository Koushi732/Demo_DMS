# AI Architecture — Aureon Quality Document Control System

## Provider Abstraction

All AI functionality is accessed through abstract interfaces. The concrete provider (OpenAI) can be swapped without modifying business logic.

```python
# Base interface
class BaseLLMProvider(ABC):
    @abstractmethod
    async def classify_document(self, text: str) -> ClassificationResult: ...
    
    @abstractmethod
    async def extract_metadata(self, text: str, document_type: str) -> dict: ...
    
    @abstractmethod
    async def generate_summary(self, text: str) -> SummaryResult: ...
    
    @abstractmethod
    async def answer_question(self, question: str, context_chunks: list) -> AnswerResult: ...

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    async def create_embedding(self, text: str) -> list[float]: ...
    
    @abstractmethod
    async def create_embeddings_batch(self, texts: list[str]) -> list[list[float]]: ...

class BaseOCRProvider(ABC):
    @abstractmethod
    async def extract_text(self, file_path: str) -> OCRResult: ...
```

## AI Capabilities

### 1. Document Classification
- Input: Extracted document text (first N pages)
- Output: Suggested document type, department, classification level
- Confidence score included
- Presented as "AI Suggestion" — user must verify

### 2. Metadata Extraction
- Input: Document text + document type schema
- Output: Structured metadata matching the type's schema
- Examples: Process Area, Equipment Name, Training Required
- All extracted fields marked `is_ai_generated = true`
- User can accept, modify, or reject each field

### 3. Document Summary
- Input: Full document text
- Output: Summary, key points, important dates, responsibilities, potential issues
- Displayed in AI Summary screen with citation highlights

### 4. Semantic Search (pgvector)
- Documents are chunked (512 tokens, 50 token overlap)
- Each chunk embedded via embedding model (text-embedding-3-small)
- Stored in `document_chunks` table with pgvector VECTOR(1536)
- Query: User text → embedding → cosine similarity search → top-K chunks

### 5. RAG / Ask Documents
- User submits question
- Question embedded → vector search → retrieve top relevant chunks
- Chunks assembled into LLM context with source metadata
- LLM prompted to answer ONLY from provided context
- Response includes source citations (document number, page)
- If insufficient context: "I could not find sufficient information in the available documents."

## Processing Pipeline

```
Upload Complete
    │
    ▼
[ARQ Worker: text_extraction]
    │ PyMuPDF / python-docx / openpyxl
    ▼
Text Extracted? ──No──► [ARQ Worker: ocr_task] (Tesseract)
    │                         │
    │ Yes                     ▼
    ▼                    OCR Text
    │◄────────────────────────┘
    ▼
[ARQ Worker: ai_classification]
    │ LLM classifies document type
    ▼
[ARQ Worker: ai_metadata_extraction]  
    │ LLM extracts structured metadata
    ▼
[ARQ Worker: ai_summary]
    │ LLM generates summary
    ▼
[ARQ Worker: create_embeddings]
    │ Chunk text → embed → store in pgvector
    ▼
[ARQ Worker: update_search_index]
    │ Update tsvector for full-text search
    ▼
Processing Complete (status = READY)
```

## Safety Rules

1. AI output is NEVER authoritative — always marked as suggestions
2. AI-generated metadata has `is_ai_generated = true` flag
3. Human verification is required before AI metadata becomes official
4. RAG answers must cite specific source documents and pages
5. RAG must refuse to answer when context is insufficient
6. All AI processing happens in background workers (never blocks HTTP requests)
7. Failed AI tasks are retryable with exponential backoff
