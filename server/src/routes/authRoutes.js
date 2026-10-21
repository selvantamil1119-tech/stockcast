import express from 'express';
import { register, login, getProfile, updateProfile, regenerateApiKey } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/regenerate-key', authenticate, regenerateApiKey);

export default router;
