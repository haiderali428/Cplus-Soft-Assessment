import { NextRequest } from "next/server";
import { db } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const project = await db.projects.findById(id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json();
  const updated = await db.projects.updateOne(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const deleted = await db.projects.deleteOne(id);
  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(deleted);
}
