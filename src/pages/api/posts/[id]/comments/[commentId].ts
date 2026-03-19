import type { APIRoute } from "astro";
import { db } from "../../../../../lib/database";
import { auth } from "../../../../../lib/auth";

export const PUT: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });

  const { commentId } = context.params;

  try {
    const data = await context.request.json();
    if (!data.content || data.content.trim() === "") {
        return new Response(JSON.stringify({ error: "El contenido no puede estar vacío" }), { status: 400 });
    }

    const comment = db.query("SELECT user_id FROM comments WHERE id = ?").get(commentId) as any;
    if (!comment) return new Response(JSON.stringify({ error: "Comentario no encontrado" }), { status: 404 });

    if (comment.user_id !== user.id && !user.is_admin) {
      return new Response(JSON.stringify({ error: "Permiso denegado" }), { status: 403 });
    }

    db.query("UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(data.content, commentId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Cuerpo de solicitud inválido" }), { status: 400 });
  }
};

export const DELETE: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });

  const { commentId } = context.params;
  
  const comment = db.query("SELECT user_id FROM comments WHERE id = ?").get(commentId) as any;
  if (!comment) return new Response(JSON.stringify({ error: "Comentario no encontrado" }), { status: 404 });

  if (comment.user_id !== user.id && !user.is_admin) {
    return new Response(JSON.stringify({ error: "Permiso denegado" }), { status: 403 });
  }

  db.query("DELETE FROM comments WHERE id = ?").run(commentId);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
