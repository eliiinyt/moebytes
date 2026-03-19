import type { APIRoute } from "astro";
import { db } from "../../../lib/database";
import { auth } from "../../../lib/auth";

export const GET: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const notifications = db.query(`
      SELECT n.*, u.username as actor_name, u.avatar as actor_avatar
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all(user.id);

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const { id } = await context.request.json();
    
    if (id) {
      db.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(id, user.id);
    } else {
      db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(user.id);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const { id } = await context.request.json().catch(() => ({}));
    
    if (id) {
      db.query("DELETE FROM notifications WHERE id = ? AND user_id = ?").run(id, user.id);
    } else {
      db.query("DELETE FROM notifications WHERE user_id = ?").run(user.id);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
