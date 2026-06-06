import { NextRequest } from "next/server";
import { store } from "../_data/store";

export async function GET() {
  return Response.json(store.projects);
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
  store.projects.unshift(project);
  return Response.json(project, { status: 201 });
}
