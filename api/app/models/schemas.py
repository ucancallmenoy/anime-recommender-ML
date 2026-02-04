from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class DiscoverRequest(BaseModel):
    query: str | None = None
    seed_anime_id: int | None = Field(None, ge=1)
    limit: int = Field(18, ge=1, le=50)
    sort_by: Literal["relevance", "score", "rank", "popularity", "members"] = "relevance"
    type: str | None = None
    min_score: float | None = Field(None, ge=0, le=10)
    max_score: float | None = Field(None, ge=0, le=10)
    min_members: int | None = Field(None, ge=0)
    max_members: int | None = Field(None, ge=0)
    min_episodes: int | None = Field(None, ge=0)
    max_episodes: int | None = Field(None, ge=0)


class AnimeResult(BaseModel):
    anime_id: int
    title: str
    score: float
    rank: int
    popularity: int
    members: int
    synopsis: str
    start_date: str
    end_date: str
    type: str
    episodes: int
    image_url: str
    relevance: float | None = None


class DiscoverResponse(BaseModel):
    query: str | None = None
    seed_anime_id: int | None = None
    results: list[AnimeResult]
