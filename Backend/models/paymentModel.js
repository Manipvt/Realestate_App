const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    razorpay: {
      orderId: { type: String, required: true },
      paymentId: { type: String },
      signature: { type: String },
    },
    amount: {
      type: Number,
      required: true, // stored in paise
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    purpose: {
      type: String,
      default: "seller_contact_unlock",
    },
  },
  { timestamps: true }
);

paymentSchema.index({ buyer: 1, createdAt: -1 });
paymentSchema.index({ property: 1, buyer: 1 });
paymentSchema.index({ "razorpay.orderId": 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);