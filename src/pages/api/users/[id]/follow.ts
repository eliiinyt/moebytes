import type { APIRoute } from "astro";
import { db } from "../../../../lib/database";
import { auth } from "../../../../lib/auth";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const targetId = context.params.id;
  if (!targetId) return new Response(null, { status: 400 });

  if (targetId === user.id) {
    return new Response(JSON.stringify({ error: "No puedes seguirte a ti mismo" }), { status: 400 });
  }

  try {
    const target = db.query("SELECT id FROM users WHERE id = ?").get(targetId);
    if (!target) return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });

    const existingFollow = db.query(
      "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?"
    ).get(user.id, targetId);

    console.log(`[Follow Debug] User ${user.username} (${user.id}) trying to toggle follow on ${targetId}. Existing:`, existingFollow);

    if (existingFollow) {
      db.query("DELETE FROM follows WHERE follower_id = ? AND following_id = ?").run(user.id, targetId);
      

      return new Response(JSON.stringify({ following: false }), { status: 200 });
    } else {
      db.query("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)").run(user.id, targetId);

      db.query(`
        INSERT OR IGNORE INTO notifications (id, user_id, type, actor_id, target_id, post_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), targetId, 'follow', user.id, user.id, 'none');

      return new Response(JSON.stringify({ following: true }), { status: 200 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
