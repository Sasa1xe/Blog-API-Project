
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";

export async function createUser(username, email, password_hash) {
  const [user] = await db
    .insert(users)
    .values({
      username,
      email,
      password_hash,
    })
    .returning();
  return user;
}

export async function findUserByEmail(email) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function createSession({ session_id, user_id, expires_at }) {
  const [session] = await db
    .insert(sessions)
    .values({
      session_id,
      user_id,
      expires_at,
    })
    .returning();
  return session;
}

export async function findValidSession(session_id) {
  const [user] = await db
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
    )
    .limit(1);

  return user ?? null;
}

export async function deleteSession(session_id) {
  await db
    .delete(sessions)
    .where(eq(sessions.session_id, session_id));
}
