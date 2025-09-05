import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email format' }),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email format' }),
    password: z
      .string({ message: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ message: 'Refresh token is required' })
      .min(1, 'Refresh token is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;