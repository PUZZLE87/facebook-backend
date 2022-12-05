import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRoutes from "./routes/api/userRoutes.js";
import postRoutes from "./routes/api/postRoutes.js";
import verifyJWT from "./middlewares/verifyJWT.js";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import credentials from "./middlewares/credentials.js";
import corsOptions from "./config/corsOptions.js";
import fileUpload from "express-fileupload";

const PORT = process.env.PORT || 8000;
const app = express();

connectDB();
app.use(credentials);
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

app.use("/user", userRoutes);
app.use("/post", verifyJWT, postRoutes);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("text").send("404 Not Found");
  }
});

app.use((err, _, res) => {
  res.status(500).send(err.message);
});

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  app.listen(PORT, console.log(`Server running on port ${PORT}`));
});
