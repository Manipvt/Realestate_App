const Property = require("../models/propertyModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { uploadMultipleImages, deleteMultipleImages } = require("../services/cloudinaryService");

const normalizeFacing = (facing) => {
  if (!facing || typeof facing !== "string") return facing;
  return facing.trim().toLowerCase().replace(/[\s_]+/g, "-");
};

const normalizeAreaUnit = (unit) => {
  if (!unit || typeof unit !== "string") return unit;
  const normalized = unit.trim().toLowerCase();
  if (normalized === "acre") return "acres";
  return normalized;
};

/**
 * POST /api/properties
 * Seller creates a property listing with images
 */
exports.createProperty = catchAsync(async (req, res, next) => {
  let images = [];
  
  // Handle both file uploads and image URLs
  if (req.files && req.files.length > 0) {
    // Upload all images to Cloudinary
    const buffers = req.files.map((f) => f.buffer);
    images = await uploadMultipleImages(buffers, "realestate/properties");
  } else if (req.body.images) {
    // Handle image URLs sent from frontend
    try {
      const imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      images = imageUrls.map(url => ({
        public_id: `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: url
      }));
    } catch (error) {
      console.error('Error processing image URLs:', error);
    }
  }
  
  if (images.length === 0) {
    // Add a default image if none provided
    images = [{
      public_id: 'default_property_image',
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    }];
  }

  // Parse nested fields that come as JSON strings from multipart form
  let location, area, roadAccess, amenities;
  try {
    location   = req.body.location   ? JSON.parse(req.body.location)   : req.body.location;
    area       = req.body.area       ? JSON.parse(req.body.area)       : req.body.area;
    roadAccess = req.body.roadAccess ? JSON.parse(req.body.roadAccess) : undefined;
    amenities  = req.body.amenities  ? JSON.parse(req.body.amenities)  : undefined;
  } catch (error) {
    // If parsing fails, assume fields are already objects (from JSON request)
    location = req.body.location;
    area = req.body.area;
    roadAccess = req.body.roadAccess;
    amenities = req.body.amenities;
  }

  const normalizedFacing = normalizeFacing(req.body.facing);
  if (area && area.unit) {
    area.unit = normalizeAreaUnit(area.unit);
  }

  const property = await Property.create({
    seller: req.user.id,
    title: req.body.title,
    description: req.body.description,
    propertyType: req.body.propertyType,
    price: req.body.price,
    facing: normalizedFacing,
    area,
    location,
    roadAccess,
    amenities,
    images,
  });

  res.status(201).json({ success: true, property });
});

/**
 * GET /api/properties
 * Public — all buyers can browse listings (seller contact hidden)
 * Supports filters: city, propertyType, minPrice, maxPrice, hasRoadAccess
 */
exports.getAllProperties = catchAsync(async (req, res) => {
  const query = { status: "active" };

  if (req.query.city)         query["location.city"] = new RegExp(req.query.city, "i");
  if (req.query.propertyType) query.propertyType = req.query.propertyType;
  if (req.query.hasRoadAccess !== undefined)
    query["roadAccess.hasRoadAccess"] = req.query.hasRoadAccess === "true";

  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Pagination
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip  = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(query)
      .select("-seller") // Hide seller reference in list — unlocking reveals it
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    properties,
  });
});

/**
 * GET /api/properties/:id
 * Public — returns property details WITHOUT seller contact info
 */
exports.getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id).select("-seller");
  if (!property) return next(new AppError("Property not found.", 404));

  res.status(200).json({ success: true, property });
});

/**
 * PUT /api/properties/:id
 * Seller updates their own property
 */
exports.updateProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError("Property not found.", 404));

  if (property.seller.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to update this property.", 403));
  }

  // If new images are uploaded, add to existing (up to 10 total)
  let newImages = [];
  if (req.files && req.files.length > 0) {
    const remaining = 10 - property.images.length;
    if (remaining <= 0) return next(new AppError("Maximum 10 images already uploaded.", 400));

    const buffers = req.files.slice(0, remaining).map((f) => f.buffer);
    newImages = await uploadMultipleImages(buffers, "realestate/properties");
  }

  // Parse nested JSON fields if provided
  const updates = { ...req.body };
  ["location", "area", "roadAccess", "amenities"].forEach((field) => {
    if (typeof updates[field] === "string") {
      try { updates[field] = JSON.parse(updates[field]); } catch {}
    }
  });

  if (updates.facing) {
    updates.facing = normalizeFacing(updates.facing);
  }

  if (updates.area && updates.area.unit) {
    updates.area.unit = normalizeAreaUnit(updates.area.unit);
  }

  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    { ...updates, $push: { images: { $each: newImages } } },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, property: updated });
});

/**
 * DELETE /api/properties/:id
 * Seller deletes their own property (also removes images from Cloudinary)
 */
exports.deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError("Property not found.", 404));

  if (property.seller.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to delete this property.", 403));
  }

  // Delete images from Cloudinary
  const publicIds = property.images.map((img) => img.public_id);
  if (publicIds.length) await deleteMultipleImages(publicIds);

  await property.deleteOne();

  res.status(200).json({ success: true, message: "Property deleted successfully." });
});

/**
 * DELETE /api/properties/:id/images/:publicId
 * Seller deletes a specific image from a property
 */
exports.deletePropertyImage = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError("Property not found.", 404));

  if (property.seller.toString() !== req.user.id) {
    return next(new AppError("Not authorized.", 403));
  }

  const publicId = decodeURIComponent(req.params.publicId);
  const imageExists = property.images.some((img) => img.public_id === publicId);
  if (!imageExists) return next(new AppError("Image not found on this property.", 404));

  await deleteMultipleImages([publicId]);

  property.images = property.images.filter((img) => img.public_id !== publicId);
  await property.save();

  res.status(200).json({ success: true, message: "Image deleted.", images: property.images });
});

/**
 * GET /api/properties/seller/my-listings
 * Seller views their own listings
 */
exports.getMyListings = catchAsync(async (req, res) => {
  const properties = await Property.find({ seller: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: properties.length, properties });
});