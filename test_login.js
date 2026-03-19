import { db } from "./src/lib/database.ts";
import { auth } from "./src/lib/auth.ts";

try {
  let userRow = db.query("SELECT id, username, email, password_hash, avatar, bio, custom_rank, points, is_admin, created_at FROM users WHERE username = ?").get("test_login_check");
  console.log("DB GET SUCCESS", userRow);
} catch (err) {
  console.error("DB QUERY ERROR", err);
}
