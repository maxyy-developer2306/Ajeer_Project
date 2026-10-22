import express from 'express';
import { loginUser, registerUser, getProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', authMiddleware, getProfile);

export default router;
