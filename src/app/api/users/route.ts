import { NextRequest } from "next/server";
import { store } from "../_data/store";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const users = email
    ? store.users.filter((u) => u.email === email)
    : store.users;
  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = { ...body, id: body.id ?? crypto.randomUUID() };
  store.users.push(user);
  return Response.json(user, { status: 201 });
}
