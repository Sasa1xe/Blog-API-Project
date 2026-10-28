import express from "express";
import cookieParser from "cookie-parser";
import { pagesRouter } from "./routes/pages.routes.js";
import { authRouter } from "./routes/auth.routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());

//------------Logger---------------
app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});
//---------------------------------

//------------Routes---------------
app.use(pagesRouter);
app.use("/auth", authRouter);
//---------------------------------

//------------Error Handler-----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something Went Wrong" });
});
//------------------------------------

app.listen(3000, () => {
  console.log("listening on port 3000");
});
