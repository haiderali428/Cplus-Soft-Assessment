import { NextRequest } from "next/server";
import { store } from "../_data/store";

export async function GET() {
  return Response.json(store.tasks);
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
  store.tasks.unshift(task);
  return Response.json(task, { status: 201 });
}
