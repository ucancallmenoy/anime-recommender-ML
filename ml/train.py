from __future__ import annotations

import json
from pathlib import Path
from typing import List

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
MODEL_PATH = PROJECT_ROOT / "ml" / "model.pkl"


def _pick_column(df: pd.DataFrame, candidates: List[str]) -> str:
    for name in candidates:
        if name in df.columns:
            return name
    raise ValueError(f"None of the columns exist: {candidates}")


def _optional_column(df: pd.DataFrame, candidates: List[str]) -> str | None:
    for name in candidates:
        if name in df.columns:
            return name
    return None


def _load_anime() -> pd.DataFrame:
    anime_path = DATA_DIR / "anime.csv"

    if not anime_path.exists():
        raise FileNotFoundError(f"Missing {anime_path}")

    return pd.read_csv(anime_path)


def _normalize_anime(anime_df_raw: pd.DataFrame) -> pd.DataFrame:
    if "anime_id" not in anime_df_raw.columns:
        raise ValueError("anime.csv must include anime_id column")

    title_col = _pick_column(anime_df_raw, ["title", "name", "anime_title"])
    synopsis_col = _optional_column(anime_df_raw, ["synopsis", "description", "summary"])
    score_col = _optional_column(anime_df_raw, ["score", "rating", "mean_score"])
    rank_col = _optional_column(anime_df_raw, ["rank"])
    popularity_col = _optional_column(anime_df_raw, ["popularity", "popularity_rank"])
    members_col = _optional_column(anime_df_raw, ["members", "members_count"])
    type_col = _optional_column(anime_df_raw, ["type", "anime_type"])
    episodes_col = _optional_column(anime_df_raw, ["episodes", "episode_count"])
    start_col = _optional_column(anime_df_raw, ["start_date", "aired_from"])
    end_col = _optional_column(anime_df_raw, ["end_date", "aired_to"])
    image_col = _optional_column(anime_df_raw, ["image_url", "image", "image_link"])

    anime_df = pd.DataFrame()
    anime_df["anime_id"] = pd.to_numeric(
        anime_df_raw["anime_id"], errors="coerce"
    ).fillna(0).astype(int)
    anime_df["title"] = anime_df_raw[title_col].fillna("Unknown").astype(str)
    if synopsis_col:
        anime_df["synopsis"] = anime_df_raw[synopsis_col].fillna("").astype(str)
    else:
        anime_df["synopsis"] = ""

    if score_col:
        anime_df["score"] = (
            pd.to_numeric(anime_df_raw[score_col], errors="coerce")
            .fillna(0)
            .astype(float)
        )
    else:
        anime_df["score"] = 0.0

    if rank_col:
        anime_df["rank"] = (
            pd.to_numeric(anime_df_raw[rank_col], errors="coerce")
            .fillna(0)
            .astype(int)
        )
    else:
        anime_df["rank"] = 0

    if popularity_col:
        anime_df["popularity"] = (
            pd.to_numeric(anime_df_raw[popularity_col], errors="coerce")
            .fillna(0)
            .astype(int)
        )
    else:
        anime_df["popularity"] = 0

    if members_col:
        anime_df["members"] = (
            pd.to_numeric(anime_df_raw[members_col], errors="coerce")
            .fillna(0)
            .astype(int)
        )
    else:
        anime_df["members"] = 0

    if type_col:
        anime_df["type"] = anime_df_raw[type_col].fillna("Unknown").astype(str)
    else:
        anime_df["type"] = "Unknown"

    if episodes_col:
        anime_df["episodes"] = (
            pd.to_numeric(anime_df_raw[episodes_col], errors="coerce")
            .fillna(0)
            .astype(int)
        )
    else:
        anime_df["episodes"] = 0

    if start_col:
        anime_df["start_date"] = (
            anime_df_raw[start_col].fillna("").astype(str).replace("nan", "")
        )
    else:
        anime_df["start_date"] = ""

    if end_col:
        anime_df["end_date"] = (
            anime_df_raw[end_col].fillna("").astype(str).replace("nan", "")
        )
    else:
        anime_df["end_date"] = ""

    if image_col:
        anime_df["image_url"] = (
            anime_df_raw[image_col].fillna("").astype(str).replace("nan", "")
        )
    else:
        anime_df["image_url"] = ""

    return anime_df


def train() -> None:
    anime_df_raw = _load_anime()
    anime_df = _normalize_anime(anime_df_raw)

    documents = (
        anime_df["title"].fillna("").astype(str)
        + " "
        + anime_df["synopsis"].fillna("").astype(str)
    )

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=40000,
        ngram_range=(1, 2),
        min_df=2,
    )
    matrix = vectorizer.fit_transform(documents)
    matrix = normalize(matrix)

    model = {
        "vectorizer": vectorizer,
        "matrix": matrix,
        "anime_df": anime_df,
        "meta": {
            "n_items": int(anime_df.shape[0]),
            "vocab_size": int(len(vectorizer.vocabulary_)),
        },
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print("Model trained and saved.")
    print(json.dumps(model["meta"], indent=2))


if __name__ == "__main__":
    train()
