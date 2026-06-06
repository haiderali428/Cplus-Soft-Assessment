import type { Task, Project, User } from "@/types";

// ── In-memory store (local dev / Supabase-unavailable fallback) ────────
declare global {
  // eslint-disable-next-line no-var
  var __apiStore: { tasks: Task[]; projects: Project[]; users: User[] } | undefined;
}

type StoreName = "tasks" | "projects" | "users";
type StoreMap = { tasks: Task[]; projects: Project[]; users: User[] };

function memStore(): StoreMap {
  if (!globalThis.__apiStore) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const seed = require("../../../../db.json") as {
      tasks: unknown[];
      projects: unknown[];
      users: unknown[];
    };
    globalThis.__apiStore = {
      tasks:    JSON.parse(JSON.stringify(seed.tasks))    as Task[],
      projects: JSON.parse(JSON.stringify(seed.projects)) as Project[],
      users:    JSON.parse(JSON.stringify(seed.users))    as User[],
    };
  }
  return globalThis.__apiStore!;
}

// ── Supabase client ─────────────────────────────────────────────────────
// Requires two server-only env vars (no NEXT_PUBLIC_ prefix — never sent to browser):
//   SUPABASE_URL              e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  from Supabase dashboard → Settings → API → service_role
//
// Data is stored in one table:
//   CREATE TABLE store (key TEXT PRIMARY KEY, value JSONB NOT NULL);
// No seed needed — the first API call per collection inserts the row automatically.
const SUPABASE_ENABLED = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getSupabase() {
  // Require at call-time so the module can load without the env vars in local dev.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Unified async data access ──────────────────────────────────────────

async function read<K extends StoreName>(key: K): Promise<StoreMap[K]> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("store")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) throw new Error(error.message);

      if (data) return data.value as StoreMap[K];

      // First-ever access for this collection — seed the row from db.json.
      // upsert avoids a race condition if two cold-start requests arrive simultaneously.
      const seed = memStore()[key];
      await getSupabase().from("store").upsert({ key, value: seed });
      return seed;
    } catch (e) {
      console.error("[store] Supabase read failed, falling back to in-memory:", e);
    }
  }
  return memStore()[key];
}

async function write<K extends StoreName>(key: K, items: StoreMap[K]): Promise<void> {
  // Keep in-memory in sync so subsequent same-process reads are up to date
  (memStore() as StoreMap)[key] = items;

  if (!SUPABASE_ENABLED) return;

  try {
    const { error } = await getSupabase()
      .from("store")
      .upsert({ key, value: items });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("[store] Supabase write failed:", e);
  }
}

export const db = {
  tasks:        (): Promise<Task[]>    => read("tasks"),
  saveTasks:    (v: Task[])            => write("tasks",    v),
  projects:     (): Promise<Project[]> => read("projects"),
  saveProjects: (v: Project[])         => write("projects", v),
  users:        (): Promise<User[]>    => read("users"),
  saveUsers:    (v: User[])            => write("users",    v),
};
