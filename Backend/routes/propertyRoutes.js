const express = require("express");
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  getMyListings,
} = require("../Controllers/propertyController");
const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/role");
const upload = require("../middlewares/upload");

// Public routes
router.get("/", getAllProperties);
router.get("/seller/my-listings", protect, restrictTo("seller"), getMyListings);
router.get("/:id", getProperty);

// Seller-only routes
router.use(protect, restrictTo("seller"));
router.post("/", upload.array("images", 10), createProperty);
router.put("/:id", upload.array("images", 10), updateProperty);
router.delete("/:id", deleteProperty);
router.delete("/:id/images/:publicId", deletePropertyImage);

module.exports = router;