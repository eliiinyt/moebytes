import type { APIRoute } from "astro";
import { db, generateId } from "../../lib/database";
import { auth } from "../../lib/auth";

export const GET: APIRoute = async (context) => {
  const url = new URL(context.request.url);
  const category = url.searchParams.get("category");

  let query = `
    SELECT 
      p.id, p.title, p.content, p.category, p.created_at,
      u.username as author, u.avatar as author_avatar,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `;

  let params: any[] = [];
  if (category && category !== "all") {
    query += " WHERE p.category = ?";
    params.push(category);
  }

  query += " ORDER BY p.created_at DESC";

  const posts = db.query(query).all(...params);
  return new Response(JSON.stringify(posts), { status: 200 });
};

import { isRateLimited } from "../../lib/rate-limit";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  // rate limit para un máximo de 100 publicaciones por horas que creo que está bien.
  
  const identifier = `post_${user.id}`;
  if (isRateLimited(identifier, 100, 60 * 60 * 1000)) {
    return new Response(JSON.stringify({ error: "Has alcanzado el límite de publicaciones por hora. Intenta más tarde." }), { status: 429 });
  }

  try {
    const { title, content, category } = await context.request.json();
    if (!title || category === undefined) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const validCategories = ["general", "off-topic", "images", "errores", "requests"];
    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ error: "Categoría inválida" }), { status: 400 });
    }

    const id = generateId();
    db.query(
      "INSERT INTO posts (id, title, content, user_id, category) VALUES (?, ?, ?, ?, ?)"
    ).run(id, title, content, user.id, category);

    db.query(
      "UPDATE users SET points = points + 2 WHERE id = ?"
    ).run(user.id);

    return new Response(JSON.stringify({ id }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
