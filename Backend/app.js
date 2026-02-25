require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");
const AppError = require("./utils/AppError");

// Import routes
const authRoutes     = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const paymentRoutes  = require("./routes/paymentRoutes");
const unlockRoutes   = require("./routes/unlockRoutes");
const userRoutes     = require("./routes/userRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middlewares ──────────────────────────────────────────────────────
app.use(helmet());                    // Set security HTTP headers
app.use(mongoSanitize());             // Prevent NoSQL injection
app.use(xss());                       // Prevent XSS attacks

// CORS — allow your frontend origin
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:8081",
      "http://192.168.1.54:8081",
      "exp://192.168.1.54:8081"
    ],
    credentials: true,
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/payments",   paymentRoutes);
app.use("/api/unlock",     unlockRoutes);
app.use("/api/users",      userRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// 404 handler for unmatched routes
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(` Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;