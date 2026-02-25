const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const propertySchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    propertyType: {
      type: String,
      enum: ["land", "apartment", "villa", "commercial"],
      required: [true, "Property type is required"],
    },
    area: {
      value: { type: Number, required: [true, "Area value is required"], min: 0 },
      unit: { type: String, enum: ["sqft", "sqyd", "acres", "cents", "guntas"], default: "sqft" },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    location: {
      address: { type: String, required: [true, "Address is required"] },
      city: { type: String, required: [true, "City is required"] },
      state: { type: String, required: [true, "State is required"] },
      pincode: { type: String, match: [/^\d{6}$/, "Invalid pincode"] },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    roadAccess: {
      hasRoadAccess: { type: Boolean, default: false },
      distanceFromRoad: {
        value: { type: Number, min: 0 },                   // e.g. 50
        unit: { type: String, enum: ["meters", "feet", "km"], default: "meters" },
      },
      roadType: {
        type: String,
        enum: ["national_highway", "state_highway", "district_road", "village_road", "private_road"],
      },
    },
    amenities: {
      electricity: { type: Boolean, default: false },
      water: { type: Boolean, default: false },
      drainage: { type: Boolean, default: false },
      boundaryWall: { type: Boolean, default: false },
    },
    facing: {
      type: String,
      enum: ["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west"],
    },
    images: {
      type: [imageSchema],
      validate: [
        { validator: (v) => v.length <= 10, message: "Maximum 10 images allowed" },
      ],
    },
    status: {
      type: String,
      enum: ["active", "sold", "inactive"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast geo/location searches
propertySchema.index({ "location.city": 1, propertyType: 1, status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ seller: 1 });

module.exports = mongoose.model("Property", propertySchema);