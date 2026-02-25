const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Upload a single image buffer to Cloudinary
 * @param {Buffer} buffer - Image file buffer from multer memory storage
 * @param {string} folder - Cloudinary folder to upload into
 * @returns {Promise<{public_id, url}>}
 */
const uploadImageToCloudinary = (buffer, folder = "realestate/properties") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 900, crop: "limit", quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload multiple image buffers
 * @param {Array<Buffer>} buffers
 * @param {string} folder
 * @returns {Promise<Array<{public_id, url}>>}
 */
const uploadMultipleImages = async (buffers, folder) => {
  return Promise.all(buffers.map((buf) => uploadImageToCloudinary(buf, folder)));
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId
 */
const deleteImageFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds
 */
const deleteMultipleImages = async (publicIds) => {
  await Promise.all(publicIds.map(deleteImageFromCloudinary));
};

module.exports = {
  uploadImageToCloudinary,
  uploadMultipleImages,
  deleteImageFromCloudinary,
  deleteMultipleImages,
};