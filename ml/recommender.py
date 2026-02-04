from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "ml" / "model.pkl"


@dataclass
class DiscoverFilters:
    anime_type: str | None = None
    min_score: float | None = None
    max_score: float | None = None
    min_members: int | None = None
    max_members: int | None = None
    min_episodes: int | None = None
    max_episodes: int | None = None


@dataclass
class AnimeResult:
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


class AnimeRecommender:
    def __init__(self, model_path: Path | None = None) -> None:
        self.model_path = model_path or MODEL_PATH
        self._model = self._load_model()

        required_keys = {"vectorizer", "matrix", "anime_df"}
        missing = required_keys - set(self._model.keys())
        if missing:
            raise ValueError(
                "Model file is missing keys: "
                f"{sorted(missing)}. Re-run ml/train.py to rebuild the model."
            )

        self.vectorizer = self._model["vectorizer"]
        self.matrix = self._model["matrix"]
        self.anime_df: pd.DataFrame = self._model["anime_df"]

        self._anime_index = {
            int(anime_id): idx
            for idx, anime_id in enumerate(self.anime_df["anime_id"].tolist())
        }

    def _load_model(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {self.model_path}. Run ml/train.py first."
            )
        return joblib.load(self.model_path)

    def discover(
        self,
        query: str | None = None,
        seed_anime_id: int | None = None,
        limit: int = 20,
        sort_by: str | None = None,
        filters: Optional[DiscoverFilters] = None,
    ) -> List[AnimeResult]:
        filters = filters or DiscoverFilters()
        df = self.anime_df.copy()
        mask = self._apply_filters(df, filters)

        relevance_scores: np.ndarray | None = None
        if seed_anime_id is not None and seed_anime_id in self._anime_index:
            relevance_scores = self._score_seed(seed_anime_id)
            df["relevance"] = relevance_scores
            df = df[mask]
            df = df[df["anime_id"] != seed_anime_id]
        elif query and query.strip():
            relevance_scores = self._score_query(query)
            df["relevance"] = relevance_scores
            df = df[mask]
        else:
            df = df[mask]

        sort_key = self._resolve_sort(sort_by, has_relevance=relevance_scores is not None)
        df = self._sort_df(df, sort_key)

        results = []
        for _, record in df.head(limit).iterrows():
            results.append(self._build_result(record))
        return results

    def _resolve_sort(self, sort_by: str | None, has_relevance: bool) -> str:
        if sort_by:
            return sort_by
        return "relevance" if has_relevance else "score"

    def _sort_df(self, df: pd.DataFrame, sort_by: str) -> pd.DataFrame:
        if sort_by == "rank":
            rank_sort = df["rank"].replace(0, np.inf)
            return df.assign(_rank_sort=rank_sort).sort_values("_rank_sort").drop(
                columns="_rank_sort"
            )
        if sort_by == "popularity":
            pop_sort = df["popularity"].replace(0, np.inf)
            return df.assign(_pop_sort=pop_sort).sort_values("_pop_sort").drop(
                columns="_pop_sort"
            )
        if sort_by == "members":
            return df.sort_values("members", ascending=False)
        if sort_by == "relevance" and "relevance" in df.columns:
            return df.sort_values("relevance", ascending=False)
        return df.sort_values("score", ascending=False)

    def _apply_filters(self, df: pd.DataFrame, filters: DiscoverFilters) -> pd.Series:
        mask = pd.Series(True, index=df.index)

        if filters.anime_type and filters.anime_type.lower() != "all":
            mask &= df["type"].str.lower() == filters.anime_type.lower()
        if filters.min_score is not None:
            mask &= df["score"] >= filters.min_score
        if filters.max_score is not None:
            mask &= df["score"] <= filters.max_score
        if filters.min_members is not None:
            mask &= df["members"] >= filters.min_members
        if filters.max_members is not None:
            mask &= df["members"] <= filters.max_members
        if filters.min_episodes is not None:
            mask &= df["episodes"] >= filters.min_episodes
        if filters.max_episodes is not None:
            mask &= df["episodes"] <= filters.max_episodes

        return mask

    def _score_query(self, query: str) -> np.ndarray:
        query_vec = self.vectorizer.transform([query])
        query_vec = normalize(query_vec)
        scores = query_vec @ self.matrix.T
        return np.asarray(scores.todense()).ravel()

    def _score_seed(self, anime_id: int) -> np.ndarray:
        seed_idx = self._anime_index[anime_id]
        seed_vec = self.matrix[seed_idx]
        scores = self.matrix @ seed_vec.T
        return np.asarray(scores.todense()).ravel()

    def _build_result(self, record: pd.Series) -> AnimeResult:
        return AnimeResult(
            anime_id=int(record.get("anime_id", 0)),
            title=str(record.get("title", "Unknown")),
            score=float(record.get("score", 0.0)),
            rank=int(record.get("rank", 0)),
            popularity=int(record.get("popularity", 0)),
            members=int(record.get("members", 0)),
            synopsis=str(record.get("synopsis", "")),
            start_date=str(record.get("start_date", "")),
            end_date=str(record.get("end_date", "")),
            type=str(record.get("type", "Unknown")),
            episodes=int(record.get("episodes", 0)),
            image_url=str(record.get("image_url", "")),
            relevance=float(record.get("relevance")) if "relevance" in record else None,
        )
