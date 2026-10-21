import express from 'express';
import {
  getProducts,
  getProductBySku,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
  getInventorySummary
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/summary', getInventorySummary);
router.get('/', getProducts);
router.get('/:sku', getProductBySku);
router.post('/', createProduct);
router.put('/:sku', updateProduct);
router.patch('/:sku/adjust', adjustStock);
router.delete('/:sku', deleteProduct);

export default router;
