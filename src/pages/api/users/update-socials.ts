import type { APIRoute } from "astro";
import { db } from "../../../lib/database";
import { auth } from "../../../lib/auth";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const { socials } = await context.request.json();
    
    if (typeof socials !== 'object' || socials === null) {
      return new Response(JSON.stringify({ error: "Invalid data format" }), { status: 400 });
    }

    const socialsJson = JSON.stringify(socials);
    
    db.query("UPDATE users SET social_links = ? WHERE id = ?")
      .run(socialsJson, user.id);

    return new Response(JSON.stringify({ success: true, socials }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
