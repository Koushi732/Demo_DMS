# Aureon Quality Document Control System — Backend

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env` and fill in your values.

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

## Running Tests

```bash
pytest tests/
```
