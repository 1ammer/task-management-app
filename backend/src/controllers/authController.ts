import { Request, Response } from 'express';
import { AuthService, LoginData, RegisterData } from '../services/authService';
import catchAsync from '../utils/catchAsync';

const authService = AuthService.getInstance();

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name }: RegisterData = req.body;

  const result = await authService.register({ email, password, name });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = result.user;

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: userWithoutPassword,
      tokens: result.tokens,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginData = req.body;

  const result = await authService.login({ email, password });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = result.user;

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      tokens: result.tokens,
    },
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: {
      tokens,
    },
  });
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
    return;
  }

  const user = await authService.getUserById(userId);
  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'User not found',
    });
    return;
  }

  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    status: 'success',
    data: {
      user: userWithoutPassword,
    },
  });
});
