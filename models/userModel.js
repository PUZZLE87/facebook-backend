import mongoose from "mongoose";
import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const { ObjectId } = mongoose.Schema;

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "first name is required"],
      trim: true,
      text: true,
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      text: true,
    },
    username: {
      type: String,
      required: [true, "username is required"],
      trim: true,
      text: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    picture: {
      type: String,
      trim: true,
      default:
        "https://library.kissclipart.com/20181001/wbw/kissclipart-gsmnet-ro-clipart-computer-icons-user-avatar-4898c5072537d6e2.png",
    },
    cover: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
    },
    bYear: {
      type: Number,
      required: true,
      trim: true,
    },
    bMonth: {
      type: Number,
      required: true,
      trim: true,
    },
    bDay: {
      type: Number,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    requests: {
      type: Array,
      default: [],
    },
    search: [
      {
        user: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
    details: {
      bio: {
        type: String,
      },
      otherName: {
        type: String,
      },
      job: {
        type: String,
      },
      workPlace: {
        type: String,
      },
      highSchool: {
        type: String,
      },
      college: {
        type: String,
      },
      currentCity: {
        type: String,
      },
      hometown: {
        type: String,
      },
      relationship: {
        type: String,
        enum: ["Single", "In a relationship", "Married", "Divorced"],
      },
      instagram: {
        type: String,
      },
    },
    savedPosts: [
      {
        post: {
          type: ObjectId,
          ref: "post",
        },
        savedAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    refreshToken: [String],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  let user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);

    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateUsername = async function () {
  let user = null;
  let username = this.username;
  do {
    user = await UserModel.findOne({ username });
    if (user) username += randomstring.generate(4);
  } while (user);

  return username;
};

export default mongoose.model("User", userSchema);
