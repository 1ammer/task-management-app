import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { DbService } from './dbService';
import ApiError from '../utils/apiError';

const db = DbService.getInstance();

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static instance: AuthService;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshTokenExpiresIn: string;

  private constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateTokens(user: AuthUser): AuthTokens {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiresIn } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): AuthUser {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      return {
        id: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      throw new ApiError('Invalid token', 'Invalid token', 401);
    }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, name } = data;

    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      throw new ApiError('User already exists', 'User already exists', 400);
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await db.users.create({
      email,
      password: hashedPassword,
      name,
    });

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    return { user, tokens };
  }

  async login(data: LoginData): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = data;

    const user = await db.users.findByEmail(email);
    if (!user) {
      throw new ApiError('Invalid credentials', 'Invalid credentials', 401);
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid credentials', 'Invalid credentials', 401);
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as jwt.JwtPayload;

      const user = await db.users.findById(decoded.id);
      if (!user) {
        throw new ApiError('User not found', 'User not found', 404);
      }

      const tokens = this.generateTokens({
        id: user.id,
        email: user.email,
        name: user.name || undefined,
      });

      return tokens;
    } catch (error) {
      throw new ApiError('Invalid refresh token', 'Invalid refresh token', 401);
    }
  }
}
