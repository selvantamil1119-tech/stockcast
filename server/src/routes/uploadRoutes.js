import express from 'express';
import multer from 'multer';
import { uploadProducts, downloadTemplate } from '../controllers/uploadController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported'));
    }
  }
});

router.post('/products', optionalAuth, upload.single('file'), uploadProducts);
router.get('/template', downloadTemplate);

export default router;
