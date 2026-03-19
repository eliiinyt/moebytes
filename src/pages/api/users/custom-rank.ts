import type { APIRoute } from "astro";
import { db } from "../../../lib/database";
import { auth } from "../../../lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

export const GET: APIRoute = async () => {
  try {
    const ranksDir = path.resolve(process.cwd(), "public/custom_ranks");
    
    // Ensure dir exists
    await fs.mkdir(ranksDir, { recursive: true });
    
    // Read files
    const files = await fs.readdir(ranksDir);
    // Filter out non-images (basic check)
    const images = files.filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f));
    
    const customRanks = images.map(filename => ({
      name: filename.replace(/\.[^/.]+$/, ""), // remove extension
      icon: `/custom_ranks/${filename}`
    }));

    return new Response(JSON.stringify(customRanks), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "No se pudieron cargar los rangos personalizados" }), { status: 500 });
  }
};

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const { custom_rank } = await context.request.json();
    

    if (custom_rank === null || custom_rank === undefined || String(custom_rank).trim() === "") {
        db.query("UPDATE users SET custom_rank = NULL WHERE id = ?").run(user.id);
        const updatedUserRow = db.query("SELECT * FROM users WHERE id = ?").get(user.id) as any;
        const newToken = auth.createSession({ ...updatedUserRow, is_admin: Boolean(updatedUserRow.is_admin) });
        auth.setSessionCookie(context, newToken);
        return new Response(JSON.stringify({ success: true, custom_rank: null }), { status: 200 });
    }

    const safeRank = String(custom_rank).trim();
    if (!safeRank.startsWith("/custom_ranks/")) {
        return new Response(JSON.stringify({ error: "Rango inválido" }), { status: 400 });
    }

    db.query("UPDATE users SET custom_rank = ? WHERE id = ?").run(safeRank, user.id);
    
    const updatedUserRow = db.query("SELECT * FROM users WHERE id = ?").get(user.id) as any;
    const newToken = auth.createSession({ ...updatedUserRow, is_admin: Boolean(updatedUserRow.is_admin) });
    auth.setSessionCookie(context, newToken);

    return new Response(JSON.stringify({ success: true, custom_rank: safeRank }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Error al actualizar el rango." }), { status: 500 });
  }
};
