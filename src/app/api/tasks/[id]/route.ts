import { NextRequest } from "next/server";
import { store } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const task = store.tasks.find((t) => t.id === id);
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(task);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  store.tasks[idx] = { ...store.tasks[idx], ...body, id };
  return Response.json(store.tasks[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const [deleted] = store.tasks.splice(idx, 1);
  return Response.json(deleted);
}
