import express, { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import profileRoutes from './profile.routes';

const router: Router = express.Router();

// Health check route
router.get('/status', (_req: Request, res: Response) => res.send('OK'));

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/profile', profileRoutes);

export default router;