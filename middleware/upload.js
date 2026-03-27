const multer = require('multer');

// Use memory storage to store the file buffer in memory
// instead of writing it to disk. This is necessary because we will 
// directly upload the stream from memory straight up to Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit images to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Basic file validation to ensure only images are processed
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;
