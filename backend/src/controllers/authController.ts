import { Request, Response } from 'express';
import { AuthService, LoginData, RegisterData } from '../services/authService';
import catchAsync from '../utils/catchAsync';

const authService = AuthService.getInstance();

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name }: RegisterData = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400).json({
      status: 'error',
      message: 'Email and password are required',
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid email format',
    });
    return;
  }

  // Validate password strength
  if (password.length < 6) {
    res.status(400).json({
      status: 'error',
      message: 'Password must be at least 6 characters long',
    });
    return;
  }

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

  // Validate required fields
  if (!email || !password) {
    res.status(400).json({
      status: 'error',
      message: 'Email and password are required',
    });
    return;
  }

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

  if (!refreshToken) {
    res.status(400).json({
      status: 'error',
      message: 'Refresh token is required',
    });
    return;
  }

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
  const user = req.user;

  if (!user) {
    res.status(401).json({
      status: 'error',
      message: 'User not authenticated',
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
