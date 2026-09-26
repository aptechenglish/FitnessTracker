import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

async function test() {
  try {
    console.log("Connecting to MongoDB Atlas at URI:", process.env.MONGO_URI ? "URI Loaded" : "Missing URI");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ SUCCESS! Connected to: ${conn.connection.host}, database: ${conn.connection.name}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

test();
