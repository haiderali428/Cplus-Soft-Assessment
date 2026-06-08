"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-md" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tag-design cursor-pointer"
    >
      {/* key forces unmount/remount on theme change, triggering animate-theme-icon */}
      {isDark ? (
        <Sun
          key="sun"
          size={18}
          className="animate-theme-icon"
          style={{ color: "var(--color-heading)" }}
          aria-hidden
        />
      ) : (
        <Moon
          key="moon"
          size={18}
          className="animate-theme-icon"
          style={{ color: "var(--color-heading)" }}
          aria-hidden
        />
      )}
    </button>
  );
}
