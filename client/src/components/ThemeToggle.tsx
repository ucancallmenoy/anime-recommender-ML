import { useEffect, useState } from "react";

const STORAGE_KEY = "anime-theme";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved) {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text)] transition hover:-translate-y-0.5"
    >
      <span className="text-[10px] text-[var(--muted)]">Theme</span>
      <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[10px] text-[var(--accent)]">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
