import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";

export async function createUser({ username, email, password_hash }) {
  const res = await db
    .insert(users)
    .values({
      username: username,
      email: email,
      password_hash: password_hash,
    })
    .returning();
  return res;
}
export async function findUserByEmail(email) {
  const data = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (data.length) {
    return data[0];
  } else {
    return false;
  }
}
export async function createSession({ session_id, user_id, expires_at }) {}

export async function findValidSession(session_id) {}

export async function deleteSession(session_id) {}
