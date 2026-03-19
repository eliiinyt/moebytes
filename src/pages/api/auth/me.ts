import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const GET: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  return new Response(JSON.stringify({ user }), { status: 200 });
};
