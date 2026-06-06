import { NextRequest } from "next/server";
import { store } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const project = store.projects.find((p) => p.id === id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  store.projects[idx] = { ...store.projects[idx], ...body, id };
  return Response.json(store.projects[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const [deleted] = store.projects.splice(idx, 1);
  return Response.json(deleted);
}
