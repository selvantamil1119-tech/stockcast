import express from 'express';
import {
  getDashboardAnalytics,
  recordSale
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.post('/sales', recordSale);

export default router;
