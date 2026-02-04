import type { AnimeResult } from "../types/anime";

interface AnimeCardProps {
  anime: AnimeResult;
  onFindSimilar?: (anime: AnimeResult) => void;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function yearFromDate(value: string) {
  if (!value) {
    return "";
  }
  const match = value.match(/\d{4}/);
  return match ? match[0] : "";
}

export function AnimeCard({ anime, onFindSimilar }: AnimeCardProps) {
  const membersLabel = anime.members > 0 ? formatNumber(anime.members) : "N/A";
  const scoreLabel = anime.score > 0 ? anime.score.toFixed(2) : "N/A";
  const startYear = yearFromDate(anime.start_date);
  const endYear = yearFromDate(anime.end_date);
  const yearLabel = startYear
    ? endYear && endYear !== startYear
      ? `${startYear}-${endYear}`
      : startYear
    : "Unknown";
  const relevance =
    anime.relevance !== undefined && anime.relevance !== null
      ? Math.round(anime.relevance * 100)
      : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)] via-transparent to-[var(--accent-2-soft)] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <div className="relative h-48 overflow-hidden">
          {anime.image_url ? (
            <img
              src={anime.image_url}
              alt={anime.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--surface-2)] text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.7)] via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-2 text-xs text-white">
            <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1">
              {anime.type || "Unknown"}
            </span>
            <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1">
              {anime.episodes || 0} eps
            </span>
            <span className="rounded-full bg-[rgba(255,255,255,0.16)] px-3 py-1">
              {yearLabel}
            </span>
            {relevance !== null && (
              <span className="rounded-full bg-[rgba(255,255,255,0.22)] px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                {relevance}% match
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">
                {anime.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                {anime.synopsis || "Synopsis not available yet."}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-2)] px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Score
              </p>
              <p className="text-lg font-bold text-[var(--accent-2)]">{scoreLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                Rank {anime.rank > 0 ? `#${anime.rank}` : "N/A"}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                Popularity {anime.popularity > 0 ? `#${anime.popularity}` : "N/A"}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                Members {membersLabel}
              </span>
            </div>
            {onFindSimilar && (
              <button
                type="button"
                onClick={() => onFindSimilar(anime)}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5"
              >
                Find similar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
