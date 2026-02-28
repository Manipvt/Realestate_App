const express = require("express");
const router = express.Router();
const { updateProfile, changePassword, getSavedListings, saveListing, unsaveListing } = require("../Controllers/userController");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.use(protect);
router.put("/update-profile", upload.single("avatar"), updateProfile);
router.put("/change-password", changePassword);
router.get("/saved-listings", getSavedListings);
router.post("/save-listing/:id", saveListing);
router.delete("/save-listing/:id", unsaveListing);

module.exports = router;