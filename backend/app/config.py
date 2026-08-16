import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    app_name: str = "Aureon Quality Document Control System"
    app_env: str = "development"
    app_debug: bool = True
    secret_key: str
    cors_origins: str = "http://localhost:3000"
    
    # Database
    database_url: str
    
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    
    # Storage
    storage_bucket: str = "documents"
    storage_url: str
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # AI & OCR
    ai_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"
    ocr_provider: str = "tesseract"
    tesseract_cmd: str = "/usr/bin/tesseract"
    
    # Limits
    max_file_size_mb: int = 100
    allowed_file_types: str = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.tiff"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
