import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Defaults to the built-in Next.js API routes (/api).
// Set NEXT_PUBLIC_API_URL=http://localhost:4000 in .env.local to use json-server instead.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Token helpers (module-level, avoids circular store imports)─────────

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    // Cookie lets the middleware (edge runtime) read auth state
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Strict`;
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
    delete api.defaults.headers.common["Authorization"];
  }
}

export function storeUserId(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(USER_ID_KEY, id);
}

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Request interceptor: attach stored token────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: centralised error handling────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      setAuthToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export default api;
