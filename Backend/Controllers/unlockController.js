const Unlock = require("../models/unlockModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * GET /api/unlock/:propertyId
 * Buyer requests seller contact details for a property they've paid to unlock
 */
exports.getSellerContact = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;

  // Check unlock record exists and is not expired
  const unlock = await Unlock.findOne({
    buyer: req.user.id,
    property: propertyId,
    expiresAt: { $gt: new Date() },
  });

  if (!unlock) {
    return next(
      new AppError(
        "You have not unlocked this seller's contact yet. Please complete payment first.",
        403
      )
    );
  }

  // Fetch only necessary seller details — never expose password or other sensitive fields
  const seller = await User.findById(unlock.seller).select("name email phone");
  if (!seller) return next(new AppError("Seller account no longer exists.", 404));

  res.status(200).json({
    success: true,
    seller: {
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
    },
    unlockedUntil: unlock.expiresAt,
  });
});

/**
 * GET /api/unlock/my-unlocks
 * Buyer views all properties they've unlocked
 */
exports.getMyUnlocks = catchAsync(async (req, res) => {
  const unlocks = await Unlock.find({
    buyer: req.user.id,
    expiresAt: { $gt: new Date() },
  })
    .populate("property", "title location.city propertyType price images")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: unlocks.length, unlocks });
});