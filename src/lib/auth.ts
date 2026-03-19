import { db, generateId } from "./database";
import bcrypt from "bcryptjs";
import type { APIContext } from "astro";
import jwt from "jsonwebtoken";

const SESSION_COOKIE_NAME = "forum_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; 
// si no existe el .env, usa esta key, pero en prod deberia existir (gracioso verdad? lo saqué de un ejemplo de mierda de stackovermuerto)
const JWT_SECRET = import.meta.env.JWT_SECRET || "moebytes_super_secret_dev_key_12345";

export interface User {
  id: string;
  username: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  custom_rank: string | null;
  points: number;
  is_admin: boolean;
  social_links: string;
  pinned_post_id: string | null;
  created_at: string;
}

export function getRankBadge(points: number, customRank?: string | null): { name: string; icon: string } {
  if (customRank) return { name: "Custom Rank", icon: customRank };
  if (points >= 500) return { name: "Moebyte", icon: "/ranks/moebyte.png" };
  if (points >= 200) return { name: "Kilobyte", icon: "/ranks/kilobyte.png" };
  if (points >= 50) return { name: "Kilobit", icon: "/ranks/kilobit.png" };
  if (points >= 10) return { name: "Byte", icon: "/ranks/byte.png" };
  return { name: "Bit", icon: "/ranks/bit.png" };
}

export const auth = {
  async register(username: string, email: string, password_plain: string): Promise<User> {
    const existing = db.query("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) throw new Error("Username already taken");

    const userId = generateId();
    const hash = await bcrypt.hash(password_plain, 10);

    db.query(
      "INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)"
    ).run(userId, username, email, hash);

    const userRow = db.query("SELECT id, username, email, avatar, bio, custom_rank, points, is_admin, social_links, pinned_post_id, created_at FROM users WHERE id = ?").get(userId) as any;
    return {
      ...userRow,
      is_admin: Boolean(userRow.is_admin)
    };
  },

  async login(username: string, password_plain: string): Promise<User> {
    const userRow = db.query("SELECT id, username, email, password_hash, avatar, bio, custom_rank, points, is_admin, social_links, pinned_post_id, created_at FROM users WHERE username = ?").get(username) as any;
    if (!userRow) throw new Error("Credenciales inválidas");

    const match = await bcrypt.compare(password_plain, userRow.password_hash);
    if (!match) throw new Error("Credenciales inválidas");

    return {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
      avatar: userRow.avatar,
      bio: userRow.bio,
      custom_rank: userRow.custom_rank,
      points: userRow.points,
      is_admin: Boolean(userRow.is_admin),
      social_links: userRow.social_links,
      pinned_post_id: userRow.pinned_post_id,
      created_at: userRow.created_at,
    };
  },

  createSession(user: User): string {
    // metemos todo el user en el jwt pa no andar buscando en la db cada rato, 
    // aunque igual hay que hacerlo pa verificar si no lo han baneado o algo, pero bueno, es mas rapido
    const token = jwt.sign(user, JWT_SECRET, {
      expiresIn: "7d",
    });

    return token;
  },

  setSessionCookie(context: APIContext, token: string) {
    context.cookies.set(SESSION_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
    });
  },

  validateSession(token: string): User | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as User;
      return decoded;
    } catch (err) {
      return null;
    }
  },

  getUserFromRequest(context: APIContext): User | null {
    const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return this.validateSession(token);
  },

  logout(context: APIContext) {
    context.cookies.delete(SESSION_COOKIE_NAME, { 
      path: "/",
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });
  }
};
