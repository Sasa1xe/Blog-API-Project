import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users } from "../db/schema.js";

export async function getCommentsByPostId(postId) {
  return await db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.post_id, postId))
    .orderBy(asc(comments.created_at), asc(comments.id));
}

export async function createComment({ post_id, user_id, content }) {
  const [comment] = await db
    .insert(comments)
    .values({
      post_id,
      user_id,
      content,
    })
    .returning({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
    });

  return comment;
}
