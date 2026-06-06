import type { Task, Project, User } from "@/types";
import { MongoClient, Collection } from "mongodb";

// ── In-memory fallback (local dev — no MONGODB_URI needed) ─────────────
declare global {
  // eslint-disable-next-line no-var
  var __apiStore: { tasks: Task[]; projects: Project[]; users: User[] } | undefined;
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined;
}

type StoreName = "tasks" | "projects" | "users";
type StoreMap = { tasks: Task[]; projects: Project[]; users: User[] };

function memStore(): StoreMap {
  if (!globalThis.__apiStore) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const seed = require("../../../../db.json") as {
      tasks: unknown[]; projects: unknown[]; users: unknown[];
    };
    globalThis.__apiStore = {
      tasks:    JSON.parse(JSON.stringify(seed.tasks))    as Task[],
      projects: JSON.parse(JSON.stringify(seed.projects)) as Project[],
      users:    JSON.parse(JSON.stringify(seed.users))    as User[],
    };
  }
  return globalThis.__apiStore!;
}

// ── MongoDB connection (one per process, reused across requests) ─────────
const MONGO_ENABLED = Boolean(process.env.MONGODB_URI);

async function getCollection(name: StoreName): Promise<Collection> {
  if (!globalThis.__mongoClient) {
    globalThis.__mongoClient = new MongoClient(process.env.MONGODB_URI!);
    await globalThis.__mongoClient.connect();
    const mdb = globalThis.__mongoClient.db();

    // Create unique index on `id` for all collections (idempotent)
    await Promise.all(
      (["tasks", "projects", "users"] as StoreName[]).map((col) =>
        mdb.collection(col).createIndex({ id: 1 }, { unique: true })
      )
    );

    // Eagerly seed ALL collections on first connection so they appear in Atlas
    // immediately without waiting for individual GET requests.
    const mem = memStore();
    await Promise.all([
      seedIfEmpty(mdb.collection("tasks"),    mem.tasks),
      seedIfEmpty(mdb.collection("projects"), mem.projects),
      seedIfEmpty(mdb.collection("users"),    mem.users),
    ]);
  }
  return globalThis.__mongoClient.db().collection(name);
}

// On first request, seed the collection from db.json if it is empty
async function seedIfEmpty(col: Collection, seed: unknown[]): Promise<void> {
  if (seed.length === 0) return;
  const count = await col.countDocuments();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (count === 0) await col.insertMany(seed as any[]);
}

// ── CRUD factory ──────────────────────────────────────────────────────────

function makeOps<T extends { id: string }>(collectionName: StoreName) {
  return {
    // find() accepts an optional MongoDB filter (e.g. { email: "x@y.com" })
    async find(filter: Record<string, unknown> = {}): Promise<T[]> {
      if (MONGO_ENABLED) {
        const col = await getCollection(collectionName);
        await seedIfEmpty(col, memStore()[collectionName] as unknown[]);
        return col
          .find(filter, { projection: { _id: 0 } })
          .sort({ createdAt: -1 })
          .toArray() as unknown as Promise<T[]>;
      }
      const items = memStore()[collectionName] as unknown as T[];
      if (Object.keys(filter).length === 0) return items;
      return items.filter((item) =>
        Object.entries(filter).every(
          ([k, v]) => (item as Record<string, unknown>)[k] === v
        )
      );
    },

    async findById(id: string): Promise<T | null> {
      if (MONGO_ENABLED) {
        const col = await getCollection(collectionName);
        return col.findOne({ id }, { projection: { _id: 0 } }) as Promise<T | null>;
      }
      return (
        (memStore()[collectionName] as unknown as T[]).find((i) => i.id === id) ?? null
      );
    },

    async insertOne(item: T): Promise<T> {
      if (MONGO_ENABLED) {
        const col = await getCollection(collectionName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await col.insertOne(item as any);
        return item;
      }
      (memStore()[collectionName] as unknown as T[]).unshift(item);
      return item;
    },

    async updateOne(id: string, patch: Partial<T>): Promise<T | null> {
      if (MONGO_ENABLED) {
        const col = await getCollection(collectionName);
        const result = await col.findOneAndUpdate(
          { id },
          { $set: { ...patch, id } },
          { returnDocument: "after", projection: { _id: 0 } }
        );
        return result as T | null;
      }
      const arr = memStore()[collectionName] as unknown as T[];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      arr[idx] = { ...arr[idx], ...patch };
      return arr[idx];
    },

    async deleteOne(id: string): Promise<T | null> {
      if (MONGO_ENABLED) {
        const col = await getCollection(collectionName);
        const result = await col.findOneAndDelete({ id }, { projection: { _id: 0 } });
        return result as T | null;
      }
      const arr = memStore()[collectionName] as unknown as T[];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      return arr.splice(idx, 1)[0];
    },
  };
}

export const db = {
  tasks:    makeOps<Task>("tasks"),
  projects: makeOps<Project>("projects"),
  users:    makeOps<User>("users"),
};
