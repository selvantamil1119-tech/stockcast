import express from 'express';
import {
  getReplenishmentRecommendations,
  createPurchaseOrder,
  getPurchaseOrders,
  receivePurchaseOrder
} from '../controllers/replenishmentController.js';

const router = express.Router();

router.get('/recommendations', getReplenishmentRecommendations);
router.get('/orders', getPurchaseOrders);
router.post('/orders', createPurchaseOrder);
router.patch('/orders/:orderNumber/receive', receivePurchaseOrder);

export default router;
