require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
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

// Trust reverse proxies (required for accurate IP-based limits in production)
app.set("trust proxy", 1);

// ─── Security Middlewares ──────────────────────────────────────────────────────
app.use(helmet());                    // Set security HTTP headers
app.use(compression());               // Compress JSON responses for lower bandwidth usage
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

// Base API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 600,
  message: "Too many requests from this IP, please try again shortly.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive routes get stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 80,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.PAYMENT_RATE_LIMIT_MAX) || 120,
  message: "Too many payment requests. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",       authLimiter, authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/payments",   paymentLimiter, paymentRoutes);
app.use("/api/unlock",     unlockRoutes);
app.use("/api/users",      userRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

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