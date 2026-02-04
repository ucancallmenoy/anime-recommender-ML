export interface AnimeResult {
  anime_id: number;
  title: string;
  score: number;
  rank: number;
  popularity: number;
  members: number;
  synopsis: string;
  start_date: string;
  end_date: string;
  type: string;
  episodes: number;
  image_url: string;
  relevance?: number | null;
}

export type SortBy = "relevance" | "score" | "rank" | "popularity" | "members";

export interface DiscoverRequest {
  query?: string;
  seed_anime_id?: number | null;
  limit?: number;
  sort_by?: SortBy;
  type?: string | null;
  min_score?: number | null;
  max_score?: number | null;
  min_members?: number | null;
  max_members?: number | null;
  min_episodes?: number | null;
  max_episodes?: number | null;
}
