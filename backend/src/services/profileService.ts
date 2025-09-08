import { User } from '@prisma/client';
import { DbService } from './dbService';
import { AuthService } from './authService';
import ApiError from '../utils/apiError';

const db = DbService.getInstance();
const authService = AuthService.getInstance();

export interface UpdateProfileData {
  name?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await db.users.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 'User not found', 404);
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    const { name } = data;

    const updateData: Partial<User> = {};
    if (name !== undefined) updateData.name = name;

    const updatedUser = await db.users.update(userId, updateData);
    if (!updatedUser) {
      throw new ApiError('User not found', 'User not found', 404);
    }

    return updatedUser;
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    const { currentPassword, newPassword } = data;

    const user = await db.users.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 'User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await authService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ApiError('Current password is incorrect', 'Current password is incorrect', 400);
    }

    // Hash new password
    const hashedNewPassword = await authService.hashPassword(newPassword);

    // Update password
    await db.users.update(userId, { password: hashedNewPassword });
  }

}
