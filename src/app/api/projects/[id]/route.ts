import { NextRequest } from "next/server";
import { db } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const projects = await db.projects();
  const project = projects.find((p) => p.id === id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const projects = await db.projects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  projects[idx] = { ...projects[idx], ...body, id };
  await db.saveProjects(projects);
  return Response.json(projects[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const projects = await db.projects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const [deleted] = projects.splice(idx, 1);
  await db.saveProjects(projects);
  return Response.json(deleted);
}
