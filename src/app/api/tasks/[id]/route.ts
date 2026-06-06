import { NextRequest } from "next/server";
import { db } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tasks = await db.tasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(task);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tasks = await db.tasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  tasks[idx] = { ...tasks[idx], ...body, id };
  await db.saveTasks(tasks);
  return Response.json(tasks[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const tasks = await db.tasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const [deleted] = tasks.splice(idx, 1);
  await db.saveTasks(tasks);
  return Response.json(deleted);
}
