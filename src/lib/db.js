import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables");
    process.exit(1);
  }

  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongoose connection successful on host:${connect.connection.host}`);
  } catch (err) {
    console.log("error in db connection:", err.message);
    process.exit(1);
  }
};