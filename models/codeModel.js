import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const codeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    user: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Code", codeSchema);
