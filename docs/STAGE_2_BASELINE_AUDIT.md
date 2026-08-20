# Stage 2 Baseline Audit Report

## Overview
This audit was conducted to identify all remaining simulated functionality, hardcoded data, and mocked dependencies across the Aureon DMS repository prior to beginning Stage 2. The goal is to ensure the transition to a fully operational backend pipeline.

## Findings

### 1. Frontend Demo Data (`frontend/src/data/demo/*`)
**Classification:** Legitimate UI fallback / Development-only demo data
**Details:** Contains static definitions of organizations, departments, users, documents, workflows, reviews, and audit events. While previously used throughout the frontend, Stage 1 has largely replaced these with live API calls.
**Action:** Retain for testing edge cases or storybooks, but ensure no production route depends on them for core data.

### 2. Backend Seeding Scripts (`backend/scripts/seed_documents.py`)
**Classification:** Test fixture
**Details:** Contains `DEMO_DOCUMENTS` and associated demo users to initialize the database for local development. 
**Action:** Retain. This is necessary for resetting the database state during development.

### 3. Processing Service (`backend/app/services/processing_service.py`)
**Classification:** Temporary implementation
**Details:** Both `process_document_version` and `get_processing_status` are fully mocked. They return hardcoded JSON indicating successful completion of OCR and extraction stages without performing any actual file processing.
**Action:** This requires a complete rewrite in Stage 2 to handle actual file bytes, perform text extraction (PDF/DOCX), handle progress updates, and save extracted text to the DB.

### 4. AI Service (`backend/app/services/ai_service.py`)
**Classification:** Temporary implementation
**Details:** The `AIService` methods (`summarize_document`, `extract_metadata`, `ask_document`) return hardcoded JSON payloads about a generic "Quality Control SOP". 
**Action:** Implement a true abstraction layer in Stage 2 that routes text to a live LLM provider (or a verified development mock if keys are absent), using the actual extracted text from the database.

### 5. Workflow Service (`backend/app/services/workflow_service.py`)
**Classification:** Temporary implementation (Partial)
**Details:** If no template is provided, the system falls back to a "hardcoded linear flow" (Department Review -> QA Review).
**Action:** This may be acceptable for MVP but should be documented as a fallback rather than a fully dynamic resolution. 

### 6. Dashboard Endpoints (`backend/app/api/v1/endpoints/dashboard.py`)
**Classification:** Temporary implementation / Broken functionality
**Details:** The `get_recent_documents` endpoint contains a comment indicating it is "Mocking this slightly by fetching APPROVED docs". This should be verified to ensure it returns accurate recent documents according to business logic.
**Action:** Verify and replace any mocked queries with accurate ORM queries.

## Next Steps
- Verify real upload flow to ensure `upload_service.py` connects correctly to Supabase Storage.
- Replace `processing_service.py` with an actual processor (e.g., using `PyPDF2` or `pdfplumber` for PDFs, `python-docx` for DOCX).
- Create database migrations to support `DocumentExtractedContent`.
- Hook up processing results to PostgreSQL full-text search.
- Replace `ai_service.py` with a real LLM integration (e.g., OpenAI or a suitable placeholder if no API key is provided).
