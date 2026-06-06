"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";

/**
 * Fetches the users list via native fetch (intentionally not Axios,
 * to demonstrate mixed API integration alongside Redux/Axios thunks).
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Must match the default in src/lib/api.ts — /api resolves to the
    // built-in Next.js Route Handlers on Vercel when no env var is set.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

    fetch(`${apiUrl}/users`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<User[]>;
      })
      .then((data) => {
        // Strip passwords from client-side state
        setUsers(data.map(({ password: _pw, ...u }) => u as User));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}
