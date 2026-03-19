import type { APIRoute } from "astro";
import { db } from "../../../../lib/database";
import { auth } from "../../../../lib/auth";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const commentId = context.params.id;
  if (!commentId) return new Response(null, { status: 400 });

  try {
    // chequea si el comentario existe
    const comment = db.query("SELECT id FROM comments WHERE id = ?").get(commentId);
    if (!comment) return new Response(JSON.stringify({ error: "Comment not found" }), { status: 404 });

    // chequea si ya le diste like
    const existingLike = db.query(
      "SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?"
    ).get(user.id, commentId);

    if (existingLike) {
      // DESCUTUCAR
      db.query("DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?").run(user.id, commentId);
      return new Response(JSON.stringify({ liked: false }), { status: 200 });
    } else {
      // cutucar
      db.query("INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)").run(user.id, commentId);

      const comment = db.query("SELECT user_id, post_id FROM comments WHERE id = ?").get(commentId) as { user_id: string, post_id: string } | undefined;
      if (comment && comment.user_id !== user.id) {
        db.query(
          "INSERT OR IGNORE INTO notifications (id, user_id, type, actor_id, target_id, post_id) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(crypto.randomUUID(), comment.user_id, 'like_comment', user.id, commentId, comment.post_id);
      }

      return new Response(JSON.stringify({ liked: true }), { status: 200 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
