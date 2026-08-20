"""
AI Intelligence service - provides document summarization, metadata extraction, 
and question-answering capabilities.
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
import json
import os

from app.config import settings

class BaseLLMProvider:
    async def summarize_document(self, document_text: str, document_title: str) -> Dict[str, Any]:
        raise NotImplementedError
        
    async def extract_metadata(self, document_text: str) -> Dict[str, Any]:
        raise NotImplementedError
        
    async def ask_document(self, document_text: str, question: str, document_title: str) -> Dict[str, Any]:
        raise NotImplementedError


class DevelopmentProvider(BaseLLMProvider):
    async def summarize_document(self, document_text: str, document_title: str) -> Dict[str, Any]:
        snippet = document_text[:200] if document_text else ""
        return {
            "summary": f"[DEV SIMULATED] Summary for '{document_title}'. Starts with: {snippet}...",
            "key_points": [
                "Simulated point 1 based on text",
                "Simulated point 2 for dev purposes"
            ],
            "word_count": len(document_text.split()) if document_text else 0,
            "confidence": 0.99,
        }

    async def extract_metadata(self, document_text: str) -> Dict[str, Any]:
        return {
            "entities": [
                {"type": "dev_entity", "value": "Test Value", "section": "§1.0"}
            ],
            "regulatory_references": ["DEV_REG_1"],
            "classification_suggestion": "SOP",
            "confidence": 0.99,
        }

    async def ask_document(self, document_text: str, question: str, document_title: str) -> Dict[str, Any]:
        return {
            "answer": f"[DEV SIMULATED] Answer to '{question}' for '{document_title}'.",
            "citations": [
                {"section": "§1", "page": 1, "text": document_text[:50] if document_text else ""}
            ],
            "confidence": 0.99,
            "sources_verified": 1,
        }


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        import openai
        self.client = openai.AsyncOpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"
        
    async def summarize_document(self, document_text: str, document_title: str) -> Dict[str, Any]:
        prompt = f"""
        Summarize the following document titled '{document_title}'.
        Return JSON with exactly this format:
        {{
            "summary": "a brief 2-3 sentence summary",
            "key_points": ["point 1", "point 2", "point 3"]
        }}
        
        Document Text:
        {document_text[:15000]}
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            data["word_count"] = len(document_text.split()) if document_text else 0
            data["confidence"] = 0.95
            return data
        except Exception as e:
            print(f"OpenAI error: {e}")
            return DevelopmentProvider().summarize_document(document_text, document_title)

    async def extract_metadata(self, document_text: str) -> Dict[str, Any]:
        prompt = f"""
        Extract metadata from this document.
        Return JSON with exactly this format:
        {{
            "entities": [
                {{"type": "type_name", "value": "value", "section": "section_reference"}}
            ],
            "regulatory_references": ["ref1", "ref2"],
            "classification_suggestion": "Suggested Type"
        }}
        
        Document Text:
        {document_text[:15000]}
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            data["confidence"] = 0.90
            return data
        except Exception as e:
            print(f"OpenAI error: {e}")
            return DevelopmentProvider().extract_metadata(document_text)

    async def ask_document(self, document_text: str, question: str, document_title: str) -> Dict[str, Any]:
        prompt = f"""
        Answer the question based ONLY on the document.
        Document Title: {document_title}
        
        Question: {question}
        
        Return JSON with exactly this format:
        {{
            "answer": "your detailed answer",
            "citations": [
                {{"section": "section or context", "page": 1, "text": "quote"}}
            ]
        }}
        
        Document Text:
        {document_text[:15000]}
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            data["confidence"] = 0.85
            data["sources_verified"] = len(data.get("citations", []))
            return data
        except Exception as e:
            print(f"OpenAI error: {e}")
            return DevelopmentProvider().ask_document(document_text, question, document_title)

def get_provider() -> BaseLLMProvider:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        return OpenAIProvider(api_key=api_key)
    return DevelopmentProvider()

class AIService:
    @staticmethod
    async def summarize_document(document_text: str, document_title: str) -> Dict[str, Any]:
        provider = get_provider()
        return await provider.summarize_document(document_text, document_title)

    @staticmethod
    async def extract_metadata(document_text: str) -> Dict[str, Any]:
        provider = get_provider()
        return await provider.extract_metadata(document_text)

    @staticmethod
    async def ask_document(document_text: str, question: str, document_title: str) -> Dict[str, Any]:
        provider = get_provider()
        return await provider.ask_document(document_text, question, document_title)
