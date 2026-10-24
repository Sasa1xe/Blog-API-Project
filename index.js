import express from "express";
import cookieParser from "cookie-parser";
import { pagesRouter } from "./routes/pages.routes";

const app = express();
app.use(cookieParser());
app.use(express.json());

//------------Logger---------------
app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});
//---------------------------------

//------------Routes---------------
app.use(pagesRouter);

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
