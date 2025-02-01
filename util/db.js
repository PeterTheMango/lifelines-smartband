require("dotenv").config();
const mongoose = require("mongoose");
/**
 * Establishes a connection to the MongoDB database.
 * Attempts to connect to the database using the provided URI and handles potential errors.
 *
 * @async
 * @throws {Error} If the connection fails.
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Database ran into an issue");
  }
}

mongoose.connection.on("disconnected", async () => {
  console.log("MongoDB disconnected, attempting to reconnect...");
  await connectDB();
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  throw new Error("Database ran into an issue");
});

module.exports = connectDB;
