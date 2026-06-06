import { NextRequest } from "next/server";
import { db } from "../_data/store";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const users = await db.users.find(email ? { email } : {});
  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = { ...body, id: body.id ?? crypto.randomUUID() };
  const created = await db.users.insertOne(user);
  return Response.json(created, { status: 201 });
}
