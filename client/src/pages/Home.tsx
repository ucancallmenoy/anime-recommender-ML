import { useMemo, useState } from "react";

import { AnimeCard } from "../components/AnimeCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { useDiscovery } from "../hooks/useDiscovery";
import type { AnimeResult, DiscoverRequest, SortBy } from "../types/anime";

const BASE_TYPES = ["All", "TV", "Movie", "OVA", "ONA", "Special", "Music"];

function buildPayload(
  state: {
    query: string;
    seedAnime: AnimeResult | null;
    selectedType: string;
    minScore: number;
    maxScore: number | "";
    minEpisodes: number;
    maxEpisodes: number | "";
    minMembers: number | "";
    limit: number;
    sortBy: SortBy;
  },
  overrides: Partial<{
    seedAnime: AnimeResult | null;
    query: string;
  }> = {}
): DiscoverRequest {
  const seedAnime = overrides.seedAnime ?? state.seedAnime;
  const query = overrides.query ?? state.query;

  return {
    query: seedAnime ? undefined : query.trim() || undefined,
    seed_anime_id: seedAnime ? seedAnime.anime_id : undefined,
    limit: state.limit,
    sort_by: state.sortBy,
    type: state.selectedType !== "All" ? state.selectedType : undefined,
    min_score: state.minScore > 0 ? state.minScore : undefined,
    max_score: state.maxScore !== "" ? state.maxScore : undefined,
    min_episodes: state.minEpisodes > 0 ? state.minEpisodes : undefined,
    max_episodes: state.maxEpisodes !== "" ? state.maxEpisodes : undefined,
    min_members: state.minMembers !== "" ? state.minMembers : undefined,
  };
}

export function Home() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState<number | "">("");
  const [minEpisodes, setMinEpisodes] = useState(0);
  const [maxEpisodes, setMaxEpisodes] = useState<number | "">("");
  const [minMembers, setMinMembers] = useState<number | "">("");
  const [limit, setLimit] = useState(18);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [seedAnime, setSeedAnime] = useState<AnimeResult | null>(null);

  const { results, loading, error, runDiscovery, clearResults } = useDiscovery();

  const typeOptions = useMemo(() => {
    const values = new Set(BASE_TYPES);
    results.forEach((anime) => {
      if (anime.type) {
        values.add(anime.type);
      }
    });
    return Array.from(values);
  }, [results]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!seedAnime && query.trim() === "") {
      clearResults();
      return;
    }
    runDiscovery(
      buildPayload({
        query,
        seedAnime,
        selectedType,
        minScore,
        maxScore,
        minEpisodes,
        maxEpisodes,
        minMembers,
        limit,
        sortBy,
      })
    );
  };

  const handleFindSimilar = (anime: AnimeResult) => {
    setSeedAnime(anime);
    runDiscovery(
      buildPayload(
        {
          query,
          seedAnime,
          selectedType,
          minScore,
          maxScore,
          minEpisodes,
          maxEpisodes,
          minMembers,
          limit,
          sortBy,
        },
        { seedAnime: anime, query: "" }
      )
    );
  };

  const handleClearSeed = () => {
    setSeedAnime(null);
    if (query.trim() === "") {
      clearResults();
      return;
    }
    runDiscovery(
      buildPayload(
        {
          query,
          seedAnime,
          selectedType,
          minScore,
          maxScore,
          minEpisodes,
          maxEpisodes,
          minMembers,
          limit,
          sortBy,
        },
        { seedAnime: null }
      )
    );
  };

  const handleClearAll = () => {
    setQuery("");
    setSeedAnime(null);
    setSelectedType("All");
    setMinScore(0);
    setMaxScore("");
    setMinEpisodes(0);
    setMaxEpisodes("");
    setMinMembers("");
    setLimit(18);
    setSortBy("relevance");
    clearResults();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-[var(--accent-soft)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-40 h-96 w-96 rounded-full bg-[var(--accent-2-soft)] blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Anime Atlas
            </p>
            <h1 className="mt-2 text-4xl font-bold text-[var(--text)] md:text-5xl">
              Explore a universe of anime stories
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">
              Semantic search blends title, synopsis, and metadata so you can discover
              new favorites or find shows that feel just like the ones you love.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">
                  Discovery controls
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Search by title or synopsis, then filter by score, type, or episode
                  count to refine the vibe.
                </p>
              </div>
              {seedAnime && (
                <button
                  type="button"
                  onClick={handleClearSeed}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text)]"
                >
                  Clear seed
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                Search
                <input
                  type="text"
                  placeholder="Try a theme, character, or title"
                  value={query}
                  onChange={(event) => {
                    const next = event.target.value;
                    setQuery(next);
                    if (!seedAnime && next.trim() === "") {
                      clearResults();
                    }
                  }}
                  disabled={Boolean(seedAnime)}
                  className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                />
                {seedAnime && (
                  <span className="text-xs text-[var(--muted)]">
                    Similarity mode active for: {seedAnime.title}
                  </span>
                )}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                  Type
                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortBy)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="score">Score</option>
                    <option value="rank">Rank</option>
                    <option value="popularity">Popularity</option>
                    <option value="members">Members</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                  Minimum score
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={minScore}
                    onChange={(event) => setMinScore(Number(event.target.value))}
                  />
                  <span className="text-xs text-[var(--muted)]">{minScore.toFixed(1)}+</span>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                  Max score
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={maxScore}
                    onChange={(event) =>
                      setMaxScore(event.target.value === "" ? "" : Number(event.target.value))
                    }
                    className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                    placeholder="Any"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">Episodes</span>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min={0}
                      value={minEpisodes}
                      onChange={(event) => setMinEpisodes(Number(event.target.value))}
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min={0}
                      value={maxEpisodes}
                      onChange={(event) =>
                        setMaxEpisodes(event.target.value === "" ? "" : Number(event.target.value))
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                  Minimum members
                  <input
                    type="number"
                    min={0}
                    value={minMembers}
                    onChange={(event) =>
                      setMinMembers(event.target.value === "" ? "" : Number(event.target.value))
                    }
                    className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                    placeholder="Any"
                  />
                  <span className="text-xs text-[var(--muted)]">
                    Members reflect overall interest on the platform.
                  </span>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text)]">
                  Results
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={limit}
                    onChange={(event) => setLimit(Number(event.target.value))}
                    className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                  />
                </label>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--muted)]">
                  Tip: Popularity ranks are lower for bigger hits, so sorting by
                  popularity shows the most mainstream picks.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Discover anime
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--text)]">How it works</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                We embed every synopsis with TF-IDF and measure cosine similarity to
                find stories with the same vibe. Use search for themes, or pick a seed
                title for instant look-alikes.
              </p>
              <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>Model</span>
                  <span className="font-semibold text-[var(--text)]">Semantic search</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signals</span>
                  <span className="font-semibold text-[var(--text)]">Synopsis + title</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Endpoint</span>
                  <span className="font-semibold text-[var(--text)]">POST /discover</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--text)]">Your seed</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {seedAnime
                  ? `Similarity mode is on for ${seedAnime.title}.`
                  : "Pick any card and tap Find similar to start a seed search."}
              </p>
              {seedAnime && (
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                  <p className="font-semibold text-[var(--text)]">{seedAnime.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {seedAnime.type} {seedAnime.episodes ? `- ${seedAnime.episodes} eps` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--text)]">Discoveries</h2>
              <p className="text-sm text-[var(--muted)]">
                Showing {results.length} results
              </p>
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
              Loading anime...
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--accent)]">
              {error}
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
              Search for a title or tap Find similar to start discovering.
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.map((anime) => (
              <AnimeCard key={anime.anime_id} anime={anime} onFindSimilar={handleFindSimilar} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
