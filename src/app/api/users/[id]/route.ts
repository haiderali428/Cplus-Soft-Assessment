import { NextRequest } from "next/server";
import { store } from "../../_data/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const user = store.users.find((u) => u.id === id);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(user);
}
