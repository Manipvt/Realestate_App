const AppError = require("../utils/AppError");

// Handle Mongoose cast errors (invalid ObjectId)
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

// Handle Mongoose duplicate field errors
const handleDuplicateFieldsError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 409);
};

// Handle Mongoose validation errors
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation Error: ${messages.join(". ")}`, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

// Dev: full stack trace; Prod: clean message only
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }
  // Programming or unknown error — don't leak details
  console.error("UNEXPECTED ERROR:", err);
  res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  let error = { ...err, message: err.message };

  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateFieldsError(err);
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendErrorProd(error, res);
};