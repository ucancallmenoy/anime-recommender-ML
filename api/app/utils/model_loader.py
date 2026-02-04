from __future__ import annotations

from functools import lru_cache

from api.app.core.config import settings
from ml.recommender import AnimeRecommender


@lru_cache
def get_recommender() -> AnimeRecommender:
    return AnimeRecommender(settings.MODEL_PATH)
