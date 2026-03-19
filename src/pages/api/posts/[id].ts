import type { APIRoute } from "astro";
import { db } from "../../../lib/database";
import { auth } from "../../../lib/auth";

export const PUT: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });

  const { id } = context.params;
  
  try {
    const data = await context.request.json();
    if (!data.content || data.content.trim() === "") {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío" }), { status: 400 });
    }

    const post = db.query("SELECT user_id FROM posts WHERE id = ?").get(id) as any;
    if (!post) return new Response(JSON.stringify({ error: "Publicación no encontrada" }), { status: 404 });

    if (post.user_id !== user.id && !user.is_admin) {
        return new Response(JSON.stringify({ error: "Permiso denegado" }), { status: 403 });
    }

    db.query("UPDATE posts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(data.content, id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/posts/[id]:", error);
    return new Response(JSON.stringify({ error: "Cuerpo de solicitud inválido o error interno" }), { status: 400 });
  }
};

export const DELETE: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });

  const { id } = context.params;
  
  const post = db.query("SELECT user_id FROM posts WHERE id = ?").get(id) as any;
  if (!post) return new Response(JSON.stringify({ error: "Publicación no encontrada" }), { status: 404 });

  if (post.user_id !== user.id && !user.is_admin) {
    return new Response(JSON.stringify({ error: "Permiso denegado" }), { status: 403 });
  }

  db.query("DELETE FROM comments WHERE post_id = ?").run(id);
  db.query("DELETE FROM posts WHERE id = ?").run(id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
