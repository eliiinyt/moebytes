import type { APIRoute } from "astro";
import { db } from "../../../../lib/database";
import { auth } from "../../../../lib/auth";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const postId = context.params.id;
  if (!postId) return new Response(null, { status: 400 });

  try {
    const post = db.query("SELECT id FROM posts WHERE id = ?").get(postId);
    if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });

    const existingLike = db.query(
      "SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?"
    ).get(user.id, postId);

    if (existingLike) {
      db.query("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?").run(user.id, postId);
      return new Response(JSON.stringify({ liked: false }), { status: 200 });
    } else {
      db.query("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)").run(user.id, postId);
      
      const postAuthor = db.query("SELECT user_id FROM posts WHERE id = ?").get(postId) as { user_id: string } | undefined;
      if (postAuthor && postAuthor.user_id !== user.id) {
        db.query(
          "INSERT OR IGNORE INTO notifications (id, user_id, type, actor_id, target_id, post_id) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(crypto.randomUUID(), postAuthor.user_id, 'like_post', user.id, postId, postId);
      }

      return new Response(JSON.stringify({ liked: true }), { status: 200 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
