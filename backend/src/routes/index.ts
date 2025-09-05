import express, { Router, Request, Response } from 'express';
// import userRoutes from './user.routes';
// import authRoutes from './auth.routes';

const router: Router = express.Router();

// Health check route
router.get('/status', (_req: Request, res: Response) => res.send('OK'));

// API routes
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

export default router;