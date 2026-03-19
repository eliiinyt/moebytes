import type { APIRoute } from "astro";
import { db } from "../../../../lib/database";
import { auth } from "../../../../lib/auth";

export const GET: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const targetId = context.params.id;
  if (!targetId) return new Response(null, { status: 400 });

  try {
    const following = db.query(`
      SELECT u.id, u.username, u.avatar, u.points, u.custom_rank
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `).all(targetId);

    return new Response(JSON.stringify(following), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
