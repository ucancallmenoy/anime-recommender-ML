from __future__ import annotations

from api.app.models.schemas import AnimeResult
from api.app.utils.model_loader import get_recommender
from ml.recommender import DiscoverFilters


def discover_anime(
    query: str | None,
    seed_anime_id: int | None,
    limit: int,
    sort_by: str,
    anime_type: str | None,
    min_score: float | None,
    max_score: float | None,
    min_members: int | None,
    max_members: int | None,
    min_episodes: int | None,
    max_episodes: int | None,
) -> list[AnimeResult]:
    recommender = get_recommender()
    filters = DiscoverFilters(
        anime_type=anime_type,
        min_score=min_score,
        max_score=max_score,
        min_members=min_members,
        max_members=max_members,
        min_episodes=min_episodes,
        max_episodes=max_episodes,
    )
    results = recommender.discover(
        query=query,
        seed_anime_id=seed_anime_id,
        limit=limit,
        sort_by=sort_by,
        filters=filters,
    )
    return [
        AnimeResult(
            anime_id=r.anime_id,
            title=r.title,
            score=r.score,
            rank=r.rank,
            popularity=r.popularity,
            members=r.members,
            synopsis=r.synopsis,
            start_date=r.start_date,
            end_date=r.end_date,
            type=r.type,
            episodes=r.episodes,
            image_url=r.image_url,
            relevance=r.relevance,
        )
        for r in results
    ]
