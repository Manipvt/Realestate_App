const express = require("express");
const router = express.Router();
const { getSellerContact, getMyUnlocks } = require("../controllers/unlockController");
const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/role");

router.use(protect, restrictTo("buyer"));
router.get("/my-unlocks", getMyUnlocks);
router.get("/:propertyId", getSellerContact);

module.exports = router;