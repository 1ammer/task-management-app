import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthUser } from '../services/authService';
import catchAsync from '../utils/catchAsync';

const authService = AuthService.getInstance();


declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Access token is required',
    });
    return;
  }

  const user = authService.verifyToken(token);
  req.user = user;

  next();
});

export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (token) {
    try {
      const user = authService.verifyToken(token);
      req.user = user;
    } catch (error) {
      req.user = undefined;
    }
  }

  next();
});
