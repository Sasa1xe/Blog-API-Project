
import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { uploadImage } from "../middleware/upload.js";
import {
  createPostSchema,
  createCommentSchema,
} from "../validation-schemas/post.js";
import {
  getAllPosts,
  getPostById,
  postExists,
  createPost,
  toggleLike,
} from "../queries/post.queries.js";
import {
  getCommentsByPostId,
  createComment,
} from "../queries/comment.queries.js";

export const postRouter = express.Router();
postRouter.use(checkAuth);

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/posts
postRouter.get("/", async (req, res) => {
  const data = await getAllPosts(req.user.id);
  res.status(200).json({ data });
});

// POST /api/posts
postRouter.post(
  "/",
  uploadImage("image"),
  validateBody(createPostSchema),
  async (req, res) => {
    const post = await createPost({
      user_id: req.user.id,
      content: req.body.content,
      image: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      message: "post created successfully",
      data: post,
    });
  },
);

// GET /api/posts/:id
postRouter.get("/:id", async (req, res) => {
  const postId = parseId(req.params.id);
  if (!postId) {
    return res.status(404).json({ error: "post not found" });
  }

  const post = await getPostById(postId, req.user.id);
  if (!post) {
    return res.status(404).json({ error: "post not found" });
  }

  const comments = await getCommentsByPostId(postId);

  res.status(200).json({
    data: {
      post,
      comments,
    },
  });
});

// POST /api/posts/:id/like
postRouter.post("/:id/like", async (req, res) => {
  const postId = parseId(req.params.id);
  if (!postId || !(await postExists(postId))) {
    return res.status(404).json({ error: "post not found" });
  }

  const data = await toggleLike(req.user.id, postId);
  res.status(200).json({ data });
});

// POST /api/posts/:id/comments
postRouter.post(
  "/:id/comments",
  validateBody(createCommentSchema),
  async (req, res) => {
    const postId = parseId(req.params.id);
    if (!postId || !(await postExists(postId))) {
      return res.status(404).json({ error: "post not found" });
    }

    const comment = await createComment({
      post_id: postId,
      user_id: req.user.id,
      content: req.body.content,
    });

    res.status(201).json({
      message: "comment created successfully",
      data: {
        ...comment,
        username: req.user.username,
      },
    });
  },
);
