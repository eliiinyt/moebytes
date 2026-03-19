import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const POST: APIRoute = async (context) => {
  try {
    const { username, password } = await context.request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const user = await auth.login(username, password);
    const token = auth.createSession(user);
    auth.setSessionCookie(context, token);

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err: any) {
    if (err.message === "Credenciales inválidas") {
      return new Response(JSON.stringify({ error: "Credenciales inválidas" }), { status: 401 });
    }
    console.error("LOGIN ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
