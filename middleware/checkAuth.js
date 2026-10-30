import { findValidSession } from "../queries/auth.queries.js";

export async function checkAuth(req, res, next) {
  const token = await findValidSession(req.session_id);
  try {
    if (!token) {
      return res.status(401).json({ error: "invalid session" });
    } else {
      next();
    }   
  } catch {
    return res.status(401).json({ error: "invalid session" });
  }
}
