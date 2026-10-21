import express from 'express';
import { recordPosSale, checkStock, posHealthCheck } from '../controllers/posController.js';
import { posAuth } from '../middleware/posAuth.js';

const router = express.Router();

router.use(posAuth);

router.get('/health', posHealthCheck);
router.get('/stock', checkStock);
router.post('/sale', recordPosSale);

export default router;
