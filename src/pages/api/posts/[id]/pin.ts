import type { APIRoute } from "astro";
import { db } from "../../../../lib/database";
import { auth } from "../../../../lib/auth";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const postId = context.params.id;
  if (!postId) return new Response(null, { status: 400 });

  try {
    // esto verifica que el post sea del usuario
    const post = db.query("SELECT id FROM posts WHERE id = ? AND user_id = ?").get(postId, user.id);
    
    if (!post) {
      return new Response(JSON.stringify({ error: "Post no encontrado o no autorizado" }), { status: 404 });
    }

    const currentUser = db.query("SELECT pinned_post_id FROM users WHERE id = ?").get(user.id) as any;
    const newPinnedId = currentUser.pinned_post_id === postId ? null : postId;
    
    db.query("UPDATE users SET pinned_post_id = ? WHERE id = ?")
      .run(newPinnedId, user.id);

    return new Response(JSON.stringify({ success: true, pinned: newPinnedId === postId }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
