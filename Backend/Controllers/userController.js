const User = require("../models/userModel");
const Property = require("../models/propertyModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require("../services/cloudinaryService");

/**
 * PUT /api/users/update-profile
 * Update name and phone (email change intentionally excluded for security)
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone } = req.body;

  // Upload avatar if provided
  let avatar;
  if (req.file) {
    const existing = await User.findById(req.user.id).select("avatar");
    if (existing?.avatar?.public_id) {
      await deleteImageFromCloudinary(existing.avatar.public_id);
    }
    avatar = await uploadImageToCloudinary(req.file.buffer, "realestate/avatars");
  }

  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (avatar) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

/**
 * PUT /api/users/change-password
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError("Please provide current and new password.", 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError("Current password is incorrect.", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully." });
});

/**
 * GET /api/users/saved-listings
 * Get user's saved property listings
 */
exports.getSavedListings = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'savedListings',
    select: '-seller'
  });

  res.status(200).json({ 
    success: true, 
    savedListings: user.savedListings || []
  });
});

/**
 * POST /api/users/save-listing/:id
 * Save a property listing
 */
exports.saveListing = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if property exists
  const property = await Property.findById(id);
  if (!property) {
    return next(new AppError("Property not found.", 404));
  }

  const user = await User.findById(req.user.id);
  
  // Check if already saved
  if (user.savedListings.includes(id)) {
    return next(new AppError("Property already saved.", 400));
  }

  user.savedListings.push(id);
  await user.save();

  res.status(200).json({ 
    success: true, 
    message: "Property saved successfully." 
  });
});

/**
 * DELETE /api/users/save-listing/:id
 * Remove a property from saved listings
 */
exports.unsaveListing = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);
  
  // Check if property is saved
  if (!user.savedListings.includes(id)) {
    return next(new AppError("Property not found in saved listings.", 404));
  }

  user.savedListings = user.savedListings.filter(
    savedId => savedId.toString() !== id
  );
  await user.save();

  res.status(200).json({ 
    success: true, 
    message: "Property removed from saved listings." 
  });
});