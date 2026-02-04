from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


class Settings:
    PROJECT_ROOT = Path(__file__).resolve().parents[3]
    _ENV_PATH = PROJECT_ROOT / ".env"

    load_dotenv(_ENV_PATH)

    MODEL_PATH = Path(
        os.getenv("MODEL_PATH", str(PROJECT_ROOT / "ml" / "model.pkl"))
    )

    _DEFAULT_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    _ORIGINS_ENV = os.getenv("CORS_ORIGINS", "")
    if _ORIGINS_ENV:
        CORS_ORIGINS = [origin.strip() for origin in _ORIGINS_ENV.split(",") if origin.strip()]
    else:
        CORS_ORIGINS = _DEFAULT_ORIGINS


settings = Settings()
