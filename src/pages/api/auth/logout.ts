import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const POST: APIRoute = async (context) => {
  auth.logout(context);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
