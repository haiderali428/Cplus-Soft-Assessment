import type { Task, Project, User } from "@/types";

// db.json is bundled by Next.js at build time (resolveJsonModule: true).
// Using globalThis so the store survives HMR restarts in dev without resetting.
declare global {
  // eslint-disable-next-line no-var
  var __apiStore: { tasks: Task[]; projects: Project[]; users: User[] } | undefined;
}

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

export const store = globalThis.__apiStore!;
