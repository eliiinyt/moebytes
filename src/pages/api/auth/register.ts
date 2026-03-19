import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const POST: APIRoute = async (context) => {
  try {
    const { username, email, password, confirmPassword } = await context.request.json();

    if (!username || !email || !password || username.length < 3 || password.length < 6) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), { status: 400 });
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Las contraseñas no coinciden" }), { status: 400 });
    }

    const user = await auth.register(username, email, password);
    const token = auth.createSession(user);
    auth.setSessionCookie(context, token);

    return new Response(JSON.stringify({ user }), { status: 201 });
  } catch (err: any) {
    if (err.message === "Username already taken") {
      return new Response(JSON.stringify({ error: "Username taken" }), { status: 409 });
    }
    console.error("REGISTER ERROR:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
