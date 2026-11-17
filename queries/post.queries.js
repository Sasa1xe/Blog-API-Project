
import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { posts, users, likes, comments } from "../db/schema.js";

function postSelectShape(currentUserId) {
  return {
    id: posts.id,
    content: posts.content,
    image: posts.image,
    created_at: posts.created_at,
    username: users.username,
    like_count: sql`cast((select count(*) from ${likes} where ${likes.post_id} = ${posts.id}) as int)`,
    comment_count: sql`cast((select count(*) from ${comments} where ${comments.post_id} = ${posts.id}) as int)`,
    liked_by_me: sql`exists(select 1 from ${likes} where ${likes.post_id} = ${posts.id} and ${likes.user_id} = ${currentUserId})`,
  };
}

export async function getAllPosts(currentUserId) {
  const data = await db
    .select(postSelectShape(currentUserId))
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .orderBy(desc(posts.created_at), desc(posts.id));
  return data;
}

export async function getPostById(postId, currentUserId) {
  const [post] = await db
    .select(postSelectShape(currentUserId))
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .where(eq(posts.id, postId));

  return post ?? null;
}

export async function createPost({ user_id, content, image }) {
  const [newPost] = await db
    .insert(posts)
    .values({
      user_id,
      content,
      image: image ?? null,
    })
    .returning();

  return newPost;
}

export async function postExists(postId) {
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return Boolean(post);
}

export async function toggleLike(userId, postId) {
  return await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(likes)
      .where(and(eq(likes.user_id, userId), eq(likes.post_id, postId)))
      .limit(1);

    let liked;
    if (existing) {
      await tx
        .delete(likes)
        .where(and(eq(likes.user_id, userId), eq(likes.post_id, postId)));
      liked = false;
    } else {
      await tx.insert(likes).values({ user_id: userId, post_id: postId });
      liked = true;
    }

    const [{ count }] = await tx
      .select({ count: sql`cast(count(*) as int)` })
      .from(likes)
      .where(eq(likes.post_id, postId));

    return {
      liked,
      like_count: count,
    };
  });
}
