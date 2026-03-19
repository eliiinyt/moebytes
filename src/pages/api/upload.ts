import type { APIRoute } from "astro";
import { auth } from "../../lib/auth";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";

import { isRateLimited } from "../../lib/rate-limit";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads");

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

export const POST: APIRoute = async (context) => {
  try {
    const user = auth.getUserFromRequest(context);
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }
    // rate limit para un máximo de 100 subidas por horas que creo que está bien.
    const identifier = `upload_${user.id}`;
    if (isRateLimited(identifier, 100, 60 * 60 * 1000)) {
      return new Response(JSON.stringify({ error: "Has alcanzado el límite de subidas. Intenta más tarde." }), { status: 429 });
    }

    const formData = await context.request.formData();
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No se proporcionó ningún archivo" }), { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return new Response(JSON.stringify({ error: "Formato de archivo no soportado" }), { status: 400 });
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return new Response(JSON.stringify({ error: "La imagen excede el límite de 15MB" }), { status: 400 });
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return new Response(JSON.stringify({ error: "El video excede el límite de 25MB" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = path.extname(file.name) || (isImage ? ".jpg" : ".mp4");
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filepath, buffer);

    // regresamos la url para que el frontend pueda mostrar la imagen o video
    return new Response(JSON.stringify({ 
      url: `/uploads/${filename}`,
      type: isImage ? "image" : "video" 
    }), { status: 200 });

  } catch (err: any) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
