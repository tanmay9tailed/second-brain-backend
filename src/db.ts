import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
const uri: string = process.env.MONGO_URI!;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB!")
  } catch(err) {
    console.error("Error in connecting to DB",err);
  }
};

export default connectDB;
