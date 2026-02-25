const AppError = require("../utils/AppError");

/**
 * Restricts route access to specified roles
 * Usage: router.post("/upload", protect, restrictTo("seller"), ...)
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. This action is restricted to: ${roles.join(", ")}`, 403)
      );
    }
    next();
  };
};