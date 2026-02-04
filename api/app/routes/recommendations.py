from __future__ import annotations

from fastapi import APIRouter

from api.app.models.schemas import DiscoverRequest, DiscoverResponse
from api.app.services.recommendation_service import discover_anime

router = APIRouter(prefix="/discover", tags=["discover"])


@router.post("/", response_model=DiscoverResponse)
def discover(request: DiscoverRequest) -> DiscoverResponse:
    results = discover_anime(
        query=request.query,
        seed_anime_id=request.seed_anime_id,
        limit=request.limit,
        sort_by=request.sort_by,
        anime_type=request.type,
        min_score=request.min_score,
        max_score=request.max_score,
        min_members=request.min_members,
        max_members=request.max_members,
        min_episodes=request.min_episodes,
        max_episodes=request.max_episodes,
    )
    return DiscoverResponse(
        query=request.query, seed_anime_id=request.seed_anime_id, results=results
    )
