import express from 'express';
import {
  getProductForecast,
  getStockoutRiskOverview
} from '../controllers/forecastController.js';

const router = express.Router();

router.get('/risks', getStockoutRiskOverview);
router.get('/:sku', getProductForecast);

export default router;
