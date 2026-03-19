import type { APIRoute } from "astro";
import { db } from "../../../lib/database";
import { auth } from "../../../lib/auth";

export const GET: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const query = context.url.searchParams.get("q") || "";
  if (query.length < 2) return new Response(JSON.stringify([]), { status: 200 });

  try {
    const users = db.query(`
      SELECT id, username, avatar, custom_rank, points
      FROM users
      WHERE username LIKE ? AND id != ?
      LIMIT 10
    `).all(`%${query}%`, user.id);

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
