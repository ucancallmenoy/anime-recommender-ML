import type { AnimeResult, DiscoverRequest } from "../types/anime";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function fetchDiscovery(
  payload: DiscoverRequest
): Promise<AnimeResult[]> {
  const response = await fetch(`${API_URL}/discover/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch discovery results");
  }

  const data = await response.json();
  return data.results as AnimeResult[];
}
