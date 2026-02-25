const mongoose = require("mongoose");

const unlockSchema = new mongoose.Schema(
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
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    expiresAt: {
      type: Date,
      // Unlock valid for 30 days — optional, remove if permanent
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// Prevent duplicate unlocks for same buyer + property
unlockSchema.index({ buyer: 1, property: 1 }, { unique: true });

module.exports = mongoose.model("Unlock", unlockSchema);