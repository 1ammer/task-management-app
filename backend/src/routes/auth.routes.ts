import express, { Router } from 'express';
import { register, login, refreshToken, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
