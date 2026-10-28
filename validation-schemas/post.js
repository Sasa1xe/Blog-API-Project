import { createInsertSchema } from "drizzle-zod";
import { posts } from "../db/schema.js";

export const createPostSchema = createInsertSchema(posts, {
  content: (schema) =>
    schema.trim().min(1, "post content cannot be empty").max(5000),
}).pick({ content: true });

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});
