import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";

export async function createUser(username, email, password_hash) {
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
export async function createSession({ session_id, user_id, expires_at }) {
  const res = await db.insert(sessions).values({
    session_id: session_id,
    user_id: user_id,
    expires_at: expires_at,
  });
  return res;
}

export async function findValidSession(session_id) {
  const user = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(
      and(
        eq(sessions.session_id, session_id),
        gt(sessions.expires_at, new Date()),
      ),
    );
  return user;
}

export async function deleteSession(session_id) {
  const res = await db
    .delete(sessions)
    .where(eq(sessions.id, session_id))
    .returning();
}
