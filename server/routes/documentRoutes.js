const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure safe storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

// Allowed document types: PDF and TXT
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.txt'];
  const allowedMimes = ['application/pdf', 'text/plain'];

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Unsupported file type. Only PDF and TXT files are supported.', 415), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Custom middleware wrapper to handle multer errors gracefully
function handleUploadMiddleware(req, res, next) {
  const uploadSingle = upload.single('document');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File size exceeds the 10MB limit.', 413));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    } else if (err) {
      return next(err);
    }
    next();
  });
}

// All document routes require JWT authentication
router.use(authenticate);

// Document routes
router.post('/upload', handleUploadMiddleware, documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
