import { NextRequest } from "next/server";
import { db } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const users = await db.users();
  const user = users.find((u) => u.id === id);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(user);
}
