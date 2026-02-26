const Property = require("../models/propertyModel");
const Payment = require("../models/paymentModel");
const Unlock = require("../models/unlockModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { createOrder, verifySignature } = require("../services/razorpayService");

const UNLOCK_PRICE = parseInt(process.env.UNLOCK_PRICE) || 9900; // ₹99 in paise

/**
 * POST /api/payments/create-order
 * Buyer initiates payment to unlock seller contact for a property
 */
exports.createPaymentOrder = catchAsync(async (req, res, next) => {
  const { propertyId } = req.body;
  if (!propertyId) return next(new AppError("Property ID is required.", 400));

  const property = await Property.findById(propertyId);
  if (!property || property.status !== "active") {
    return next(new AppError("Property not found or no longer active.", 404));
  }

  // Prevent seller from paying for their own property
  if (property.seller.toString() === req.user.id) {
    return next(new AppError("You cannot unlock your own property contact.", 400));
  }

  // Check if already unlocked and not expired
  const existingUnlock = await Unlock.findOne({
    buyer: req.user.id,
    property: propertyId,
    expiresAt: { $gt: new Date() },
  });

  if (existingUnlock) {
    return res.status(200).json({
      success: true,
      alreadyUnlocked: true,
      message: "You have already unlocked this seller's contact.",
    });
  }

  // Create Razorpay order
  const receipt = `unlock_${req.user.id}_${propertyId}`.slice(0, 40);
  const order = await createOrder(UNLOCK_PRICE, receipt);

  // Save payment record with "created" status
  const payment = await Payment.create({
    buyer: req.user.id,
    property: propertyId,
    razorpay: { orderId: order.id },
    amount: UNLOCK_PRICE,
    purpose: "seller_contact_unlock",
  });

  res.status(201).json({
    success: true,
    orderId: order.id,
    amount: UNLOCK_PRICE,
    currency: "INR",
    paymentId: payment._id,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

/**
 * POST /api/payments/verify
 * Verify Razorpay signature after successful payment on frontend
 */
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, propertyId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId) {
    return next(new AppError("All payment fields are required.", 400));
  }

  // 1. Verify signature
  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return next(new AppError("Payment verification failed. Invalid signature.", 400));
  }

  // 2. Find and update payment record
  const payment = await Payment.findOneAndUpdate(
    {
      "razorpay.orderId": razorpay_order_id,
      buyer: req.user.id,
      property: propertyId,
    },
    {
      "razorpay.paymentId": razorpay_payment_id,
      "razorpay.signature": razorpay_signature,
      status: "paid",
    },
    { new: true }
  );

  if (!payment) return next(new AppError("Payment record not found.", 404));

  // 3. Get seller from property
  const property = await Property.findById(payment.property).select("seller");
  if (!property) return next(new AppError("Property not found.", 404));

  // 4. Create unlock record (upsert to avoid duplicates if webhook fires twice)
  await Unlock.findOneAndUpdate(
    { buyer: req.user.id, property: propertyId },
    {
      buyer: req.user.id,
      property: propertyId,
      seller: property.seller,
      payment: payment._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    success: true,
    message: "Payment verified. Seller contact is now unlocked.",
  });
});

/**
 * GET /api/payments/my-payments
 * Buyer views their payment history
 */
exports.getMyPayments = catchAsync(async (req, res) => {
  const payments = await Payment.find({ buyer: req.user.id })
    .populate("property", "title location.city propertyType")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: payments.length, payments });
});