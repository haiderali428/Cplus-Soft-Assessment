import { NextRequest } from "next/server";
import { db } from "../_data/store";

export async function GET() {
  return Response.json(await db.projects.find());
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
  const created = await db.projects.insertOne(project);
  return Response.json(created, { status: 201 });
}
