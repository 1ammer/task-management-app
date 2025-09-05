import express, { Router } from 'express';
import { register, login, refreshToken, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validation';

const router: Router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
