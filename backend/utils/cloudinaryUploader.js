const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads an image buffer to Cloudinary
 * @param {Buffer} buffer - The image buffer from multer memory storage
 * @param {String} folderName - The folder in Cloudinary to store the image
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
const uploadImageToCloudinary = (buffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadImageToCloudinary };
