import express, { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

const router: Router = express.Router();

// Health check route
router.get('/status', (_req: Request, res: Response) => res.send('OK'));

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;