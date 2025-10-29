const multer = require('multer');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'tmp', 'uploads');
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    // We can add file type checks here if needed in the future
    // For now, accept all video/audio types that ffmpeg can handle
    cb(null, true);
  },
}).single('video'); // 'video' is the name of the form field on the frontend

module.exports = upload;
