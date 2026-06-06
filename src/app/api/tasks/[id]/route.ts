import { NextRequest } from "next/server";
import { db } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const task = await db.tasks.findById(id);
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(task);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  const updated = await db.tasks.updateOne(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const deleted = await db.tasks.deleteOne(id);
  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(deleted);
}
