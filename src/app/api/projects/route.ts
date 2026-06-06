import { NextRequest } from "next/server";
import { db } from "../_data/store";

export async function GET() {
  return Response.json(await db.projects());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const project = {
    ...body,
    id:        body.id        ?? crypto.randomUUID(),
    createdAt: body.createdAt ?? now,
    updatedAt: body.updatedAt ?? now,
  };
  const projects = await db.projects();
  projects.unshift(project);
  await db.saveProjects(projects);
  return Response.json(project, { status: 201 });
}
