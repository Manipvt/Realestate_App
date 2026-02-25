const express = require("express");
const router = express.Router();
const { createPaymentOrder, verifyPayment, getMyPayments } = require("../controllers/paymentController");
const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/role");

// Buyer-only payment routes
router.use(protect, restrictTo("buyer"));
router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/my-payments", getMyPayments);

module.exports = router;