import type { APIRoute } from "astro";
import { db } from "../../../lib/database";
import { auth } from "../../../lib/auth";

export const PUT: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const { bio } = await context.request.json();
    
    if (typeof bio !== 'string' || bio.length > 200) {
      return new Response(JSON.stringify({ error: "Biografía inválida o demasiado larga" }), { status: 400 });
    }
    db.query("UPDATE users SET bio = ? WHERE id = ?").run(bio, user.id);

    const { iat, exp, ...userData } = user as any;
    const updatedUser = { ...userData, bio };
    const newToken = auth.createSession(updatedUser);
    auth.setSessionCookie(context, newToken);

    return new Response(JSON.stringify({ success: true, bio }), { status: 200 });
  } catch (err) {
    console.error("Error updating bio:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
