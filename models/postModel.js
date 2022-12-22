import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["profilePicture", "cover", null],
      default: null,
    },
    text: {
      type: String,
    },
    images: {
      type: Array,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    background: { type: String },
    comments: [
      {
        comment: {
          type: String,
        },
        image: { type: String },
        commentBy: {
          type: ObjectId,
          reft: "User",
        },
        commentAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);
postSchema.plugin(aggregatePaginate);
export default mongoose.model("Post", postSchema);
