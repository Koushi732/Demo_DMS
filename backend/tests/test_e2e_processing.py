import os
import asyncio
from supabase import create_client, Client
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

import pytest

API_BASE = "http://localhost:8000/api/v1"

@pytest.mark.skip(reason="Requires live Supabase and FastAPI server")
async def test_processing():
    print("Logging in...")
    res = supabase.auth.sign_in_with_password({"email": "admin@aureon.local", "password": "Password123!"})
    token = res.session.access_token
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        # Create Document
        print("Creating document...")
        doc_data = {
            "title": "Test E2E PDF",
            "description": "E2E testing PDF processing",
            "classification": "Internal",
            "tags": ["test"]
        }
        res = await client.post(f"{API_BASE}/documents", json=doc_data, headers=headers)
        if res.status_code != 201:
            print(f"Failed to create document: {res.text}")
            return
        doc_id = res.json()["id"]
        print(f"Document created: {doc_id}")

        # Upload PDF
        print("Uploading PDF...")
        pdf_path = os.path.join(os.path.dirname(__file__), '..', 'test.pdf')
        with open(pdf_path, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            data = {'change_reason': 'Initial E2E PDF upload'}
            res = await client.post(f"{API_BASE}/documents/{doc_id}/versions", files=files, data=data, headers=headers)
            
        if res.status_code != 201:
            print(f"Failed to upload PDF: {res.text}")
            return
        print("PDF uploaded.")

        # Poll Processing Status
        print("Polling processing status...")
        for i in range(10):
            await asyncio.sleep(2)
            res = await client.get(f"{API_BASE}/documents/{doc_id}/processing", headers=headers)
            status_data = res.json()
            print(f"Status: {status_data.get('status')} | Progress: {status_data.get('overall_progress')}%")
            if status_data.get('status') == 'COMPLETED':
                break
            if status_data.get('status') == 'FAILED':
                print(f"Processing failed: {status_data.get('error_message')}")
                break

        # Check AI Summary
        print("Fetching AI summary...")
        res = await client.get(f"{API_BASE}/intelligence/{doc_id}/summary", headers=headers)
        print("Summary:", res.json())

        # Check search
        print("Testing full-text search...")
        res = await client.get(f"{API_BASE}/search?q=test", headers=headers)
        items = res.json().get("items", [])
        print(f"Found {len(items)} items matching 'test'")
        for item in items:
            if item["id"] == doc_id:
                print("E2E SUCCESS: Document found in search index!")

if __name__ == "__main__":
    asyncio.run(test_processing())
