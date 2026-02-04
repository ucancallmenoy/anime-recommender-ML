# Anime Recommender

A portfolio-ready, clean-architecture anime discovery system using Python, FastAPI, and React.

## What This Project Does
- Trains a semantic search model offline from `data/anime.csv`
- Saves the model to `ml/model.pkl`
- Serves discovery results via a FastAPI REST endpoint
- Displays results in an anime-inspired, light and dark UI

## How The Model Works (Beginner-Friendly)
Instead of user ratings, this project uses the anime descriptions directly.

We build **TF-IDF vectors** from every title + synopsis, then measure cosine
similarity to find shows with the same vibe. That powers two modes:
- Search mode: type a theme or title and get the most relevant matches
- Similarity mode: pick an anime and get near neighbors instantly

## Expected Dataset Columns
`data/anime.csv`
- `anime_id`
- `title` (or `name`)
- `synopsis`
- `score`
- `rank`
- `popularity`
- `members`
- `start_date`
- `end_date`
- `type`
- `episodes`
- `image_url`

## Project Structure
```
anime-recommender/
├── api/                         # FastAPI backend
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py        # Env + settings (CORS, model path)
│   │   ├── models/
│   │   │   └── schemas.py       # Request/response models
│   │   ├── routes/
│   │   │   └── recommendations.py # /discover endpoint
│   │   ├── services/
│   │   │   └── recommendation_service.py # Business logic
│   │   ├── utils/
│   │   │   └── model_loader.py  # Loads ML model
│   │   ├── __init__.py
│   │   └── main.py              # FastAPI app entry point
│   └── __init__.py
├── client/                      # React + Vite frontend
│   ├── .env.example             # Client env template
│   ├── index.html               # HTML shell
│   ├── package.json             # Frontend deps/scripts
│   ├── postcss.config.cjs        # PostCSS config
│   ├── tailwind.config.cjs       # Tailwind config
│   ├── tsconfig.json             # TS config
│   ├── tsconfig.node.json        # Vite TS config
│   ├── vite.config.ts            # Vite config
│   └── src/
│       ├── components/
│       │   ├── AnimeCard.tsx     # Anime card UI
│       │   └── ThemeToggle.tsx   # Light/dark toggle
│       ├── hooks/
│       │   └── useDiscovery.ts   # Discovery state + API call
│       ├── pages/
│       │   └── Home.tsx          # Main screen
│       ├── services/
│       │   └── api.ts            # API client
│       ├── styles/
│       │   └── theme.css         # Theme variables
│       ├── types/
│       │   └── anime.ts          # Shared types
│       ├── App.tsx               # App shell
│       ├── index.css             # Global styles + Tailwind
│       └── index.tsx             # React entry
├── data/
│   └── anime.csv                 # Anime dataset
├── ml/                           # ML training and inference
│   ├── __init__.py
│   ├── recommender.py            # Similarity + filtering logic
│   ├── train.py                  # Offline training script
│   └── model.pkl                 # Trained model artifact
├── .env.example                  # API env template
├── .gitignore                    # Git exclusions
├── README.md                     # Project documentation
└── requirements.txt              # Python dependencies
```

## Run The ML Training
```
python ml/train.py
```

## Run The API
```
uvicorn api.app.main:app --reload
```

## Run The Client
```
cd client
npm install
npm run dev
```

The UI will default to `http://localhost:5173` and the API to `http://localhost:8000`.

## API Endpoint
`POST /discover/`

Body:
```
{
  "query": "time travel revenge",
  "limit": 18,
  "sort_by": "relevance",
  "type": "TV",
  "min_score": 7.5
}
```

Response:
```
{
  "query": "time travel revenge",
  "seed_anime_id": null,
  "results": [
    {
      "anime_id": 1,
      "title": "Steins;Gate",
      "score": 9.1,
      "rank": 3,
      "popularity": 1,
      "members": 2300000,
      "synopsis": "A self-proclaimed mad scientist...",
      "start_date": "2011-04-01",
      "end_date": "2011-09-01",
      "type": "TV",
      "episodes": 24,
      "image_url": "https://cdn.example.com/steinsgate.jpg",
      "relevance": 0.72
    }
  ]
}
```
