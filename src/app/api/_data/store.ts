import type { Task, Project, User } from "@/types";
import { MongoClient, Collection } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined;
}

type StoreName = "tasks" | "projects" | "users";

async function getCollection(name: StoreName): Promise<Collection> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }
  if (!globalThis.__mongoClient) {
    globalThis.__mongoClient = new MongoClient(process.env.MONGODB_URI);
    await globalThis.__mongoClient.connect();
    const mdb = globalThis.__mongoClient.db();
    await Promise.all(
      (["tasks", "projects", "users"] as StoreName[]).map((col) =>
        mdb.collection(col).createIndex({ id: 1 }, { unique: true })
      )
    );
  }
  return globalThis.__mongoClient.db().collection(name);
}

function makeOps<T extends { id: string }>(collectionName: StoreName) {
  return {
    async find(filter: Record<string, unknown> = {}): Promise<T[]> {
      const col = await getCollection(collectionName);
      return col
        .find(filter, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray() as unknown as Promise<T[]>;
    },

    async findById(id: string): Promise<T | null> {
      const col = await getCollection(collectionName);
      return col.findOne({ id }, { projection: { _id: 0 } }) as Promise<T | null>;
    },

    async insertOne(item: T): Promise<T> {
      const col = await getCollection(collectionName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await col.insertOne(item as any);
      return item;
    },

    async updateOne(id: string, patch: Partial<T>): Promise<T | null> {
      const col = await getCollection(collectionName);
      const result = await col.findOneAndUpdate(
        { id },
        { $set: { ...patch, id } },
        { returnDocument: "after", projection: { _id: 0 } }
      );
      return result as T | null;
    },

    async deleteOne(id: string): Promise<T | null> {
      const col = await getCollection(collectionName);
      const result = await col.findOneAndDelete({ id }, { projection: { _id: 0 } });
      return result as T | null;
    },
  };
}

export const db = {
  tasks:    makeOps<Task>("tasks"),
  projects: makeOps<Project>("projects"),
  users:    makeOps<User>("users"),
};
