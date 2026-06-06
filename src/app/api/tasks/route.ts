import { NextRequest } from "next/server";
import { db } from "../_data/store";

export async function GET() {
  return Response.json(await db.tasks());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const task = {
    ...body,
    id:        body.id        ?? crypto.randomUUID(),
    createdAt: body.createdAt ?? now,
    updatedAt: body.updatedAt ?? now,
  };
  const tasks = await db.tasks();
  tasks.unshift(task);
  await db.saveTasks(tasks);
  return Response.json(task, { status: 201 });
}
