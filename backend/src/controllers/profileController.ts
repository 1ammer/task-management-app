import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/apiError';

const profileService = ProfileService.getInstance();

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError('User not authenticated', 'User not authenticated', 401);
  }

  const user = await profileService.getProfile(userId);
  
  // Remove password from response
  const { password, ...userWithoutPassword } = user;
  
  res.status(200).json({
    success: true,
    data: { user: userWithoutPassword },
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError('User not authenticated', 'User not authenticated', 401);
  }

  const { name } = req.body;
  const user = await profileService.updateProfile(userId, { name });
  
  // Remove password from response
  const { password, ...userWithoutPassword } = user;
  
  res.status(200).json({
    success: true,
    data: { user: userWithoutPassword },
    message: 'Profile updated successfully',
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError('User not authenticated', 'User not authenticated', 401);
  }

  const { currentPassword, newPassword } = req.body;
  await profileService.changePassword(userId, { currentPassword, newPassword });
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

