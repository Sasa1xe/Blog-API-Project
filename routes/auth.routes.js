import express from "express";
import bcrypt from "bcrypt";
import { validateBody } from "../middleware/validateBody.js";
import { registerSchema, loginSchema } from "../validation-schemas/auth.js";
import { createUser } from "../queries/auth.queries.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const body = req.body;
  const password_hash = bcrypt.hash(body.password);
  
  if (!body.email) {
    return res.status(422).json({
      error: "email already in use",
    });
  } else {
    await createUser(req.body.username, req.body.email, password_hash);
    return res.status(201).json({
      message: "register successful, you can now login",
    });
  }
});
authRouter.post("/login", async (req, res) => {});
authRouter.post("/logout", async (req, res) => {});
