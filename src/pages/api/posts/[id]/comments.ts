import type { APIRoute } from "astro";
import { db, generateId } from "../../../../lib/database";
import { auth } from "../../../../lib/auth";

export const GET: APIRoute = async (context) => {
  const id = context.params.id;
  if (!id) return new Response(null, { status: 400 });

  const query = `
    SELECT c.id, c.content, c.created_at, u.username as author, u.avatar as author_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;

  const comments = db.query(query).all(id);
  return new Response(JSON.stringify(comments), { status: 200 });
};

import { isRateLimited } from "../../../../lib/rate-limit";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const postId = context.params.id;
  if (!postId) return new Response(null, { status: 400 });

  // Rate Limiting: Max 150 comments por hora
  const identifier = `comment_${user.id}`;
  if (isRateLimited(identifier, 150, 60 * 60 * 1000)) {
    return new Response(JSON.stringify({ error: "Has alcanzado el límite de comentarios por hora. Intenta más tarde." }), { status: 429 });
  }

  try {
    const { content } = await context.request.json();
    if (content === undefined) return new Response(JSON.stringify({ error: "Missing content" }), { status: 400 });

    const id = generateId();
    db.query(
      "INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)"
    ).run(id, postId, user.id, content);

    db.query(
      "UPDATE users SET points = points + 1 WHERE id = ?"
    ).run(user.id);

    // Notify post author (if not the same user) btw this is important!!!!!1!!1!!
    const postAuthor = db.query("SELECT user_id FROM posts WHERE id = ?").get(postId) as { user_id: string } | undefined;
    if (postAuthor && postAuthor.user_id !== user.id) {
      db.query(
        "INSERT INTO notifications (id, user_id, type, actor_id, target_id, post_id) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(crypto.randomUUID(), postAuthor.user_id, 'comment', user.id, id, postId);
    }

    return new Response(JSON.stringify({ id }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
