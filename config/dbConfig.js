import mongoose from "mongoose";


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });

  } catch (error) {
    console.log(error);
  }
}

export default connectDB;
