import { findValidSession } from "../queries/auth.queries.js";

export async function checkAuth(req, res, next) {
  const sessionId = req.cookies.blog_session;

  if (!sessionId) {
    return res.status(401).json({ error: "invalid session" });
  }

  const user = await findValidSession(sessionId);

  if (!user) {
    res.clearCookie("blog_session");
    return res.status(401).json({ error: "invalid session" });
  }

  req.user = user;
  next();
}
