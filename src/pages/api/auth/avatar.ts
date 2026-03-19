import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/database";
import path from "node:path";
import fs from "node:fs/promises";

export const POST: APIRoute = async (context) => {
  const user = auth.getUserFromRequest(context);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const formData = await context.request.formData();
    const file = formData.get("avatar") as File;
    if (!file) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });

    const ext = path.extname(file.name) || ".png";
    const filename = `${user.id}-${Date.now()}${ext}`;
    const uploadDir = path.resolve(process.cwd(), "public", "avatars");
    
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    db.query("UPDATE users SET avatar = ? WHERE id = ?").run(filename, user.id);

    return new Response(JSON.stringify({ avatar: filename }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
  
  // aunque no lo crean me voy a pegar un tiro porque esto no debería ser así
};
