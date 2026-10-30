import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { validateBody } from "../middleware/validateBody.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { registerSchema, loginSchema } from "../validation-schemas/auth.js";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
} from "../queries/auth.queries.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const body = req.body;
  const password_hash = await bcrypt.hash(req.body.password, 10);
  const existingUser = await findUserByEmail(body.email);
  if (existingUser) {
    return res.status(422).json({
      error: "email already in use",
    });
  } else {
    await createUser(req.body.username, req.body.email, password_hash);
  }
  res.status(201).json({
    message: "register successful, you can now login",
  });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  //checking if the user entered an existing email or password in DB
  const existingUser = await findUserByEmail(email);
  const isPasswordCorrect =
    existingUser &&
    (await bcrypt.compare(password, existingUser.password_hash));
  if (isPasswordCorrect) {
    //generate session
    const session_id = crypto.randomBytes(32).toString("hex");

    const sessionDuration = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionDuration);

    await createSession({
      session_id: session_id,
      user_id: existingUser.id,
      expires_at: expiresAt,
    });

    res.cookie("blog_session", session_id, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
    });

    return res.status(200).json({
      message: "login successful",
      data: {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
        },
      },
    });
  } else {
    return res.status(401).json({
      error: "invalid email or password",
    });
  }
});

authRouter.get("/me", checkAuth, (req, res) => {
  res.status(200).json({
    data: {
      user: req.user,
    },
  });
});

authRouter.post("/logout", async (req, res) => {
  const session_id = req.cookies.blog_session;
  if (session_id) {
    await deleteSession(session_id);
  }
  res.clearCookie("blog_session");
  res.status(200).json({ message: "logout successful" });
});
