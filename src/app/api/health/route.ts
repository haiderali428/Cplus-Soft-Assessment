import { db } from "../_data/store";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return Response.json(
      { connected: false, error: "MONGODB_URI env var is not set" },
      { status: 500 }
    );
  }

  try {
    // Using the shared db triggers connection + eager seeding of all collections.
    // After this call, tasks / projects / users collections exist in Atlas.
    const [tasks, projects, users] = await Promise.all([
      db.tasks.find(),
      db.projects.find(),
      db.users.find(),
    ]);

    return Response.json({
      connected: true,
      database: uri.split("/").pop()?.split("?")[0] ?? "unknown",
      collections: {
        tasks:    tasks.length,
        projects: projects.length,
        users:    users.length,
      },
    });
  } catch (err) {
    return Response.json(
      { connected: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
