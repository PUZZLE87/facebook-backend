import express from "express";
import "dotenv/config";
import connectDB from "./config/dbConfig.js";
import mongoose from "mongoose";
import userRoutes from "./routes/api/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import credentials from "./middlewares/credentials.js";
const app = express();
const PORT = process.env.PORT || 8000;

connectDB();
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/user", userRoutes);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  app.listen(PORT, console.log(`Server running on port ${PORT}`));
});
