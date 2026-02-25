const crypto = require("crypto");
const razorpay = require("../config/razorpay");

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in paise (e.g., 9900 = ₹99)
 * @param {string} receipt - Unique receipt string
 */
const createOrder = async (amount, receipt) => {
  const options = {
    amount,
    currency: "INR",
    receipt,
    payment_capture: 1, // Auto capture
  };
  return razorpay.orders.create(options);
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId   - razorpay_order_id from frontend
 * @param {string} paymentId - razorpay_payment_id from frontend
 * @param {string} signature - razorpay_signature from frontend
 * @returns {boolean}
 */
const verifySignature = (orderId, paymentId, signature) => {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
};

module.exports = { createOrder, verifySignature };