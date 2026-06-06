import { NextRequest } from "next/server";
import { db } from "../_data/store";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const users = await db.users();
  return Response.json(email ? users.filter((u) => u.email === email) : users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = { ...body, id: body.id ?? crypto.randomUUID() };
  const users = await db.users();
  users.push(user);
  await db.saveUsers(users);
  return Response.json(user, { status: 201 });
}
