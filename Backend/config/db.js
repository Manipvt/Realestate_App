const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 50,
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;