//Handles MongoDB connection (only for database connection logic)
import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

