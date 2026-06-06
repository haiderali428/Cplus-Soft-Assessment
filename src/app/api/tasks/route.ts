import { NextRequest } from "next/server";
import { db } from "../_data/store";

export async function GET() {
  return Response.json(await db.tasks.find());
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
  const created = await db.tasks.insertOne(task);
  return Response.json(created, { status: 201 });
}
