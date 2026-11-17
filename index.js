import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { pagesRouter } from "./routes/pages.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import  { postRouter }  from "./routes/post.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

//------------Logger---------------
app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});
//---------------------------------

//------------Static Uploads-------
app.use("/uploads", express.static(path.resolve("uploads")));
//---------------------------------

//------------Routes---------------
app.use("/auth", authRouter);
app.use("/api/posts",postRouter);
app.use(pagesRouter);
//---------------------------------

//------------404 Handler----------
app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});
//---------------------------------

//------------Error Handler--------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});
//---------------------------------

app.listen(3000, () => {
  console.log("listening on port 3000");
});
