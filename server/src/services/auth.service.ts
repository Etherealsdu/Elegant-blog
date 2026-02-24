import jwt from 'jsonwebtoken';
import { User } from '../models';
import config from '../config';
import { AuthProvider, UserRole } from '@elegant-blog/shared';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  static async register(data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }) {
    const existingEmail = await User.findOne({ where: { email: data.email } });
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }

    const existingUsername = await User.findOne({ where: { username: data.username } });
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    const user = await User.create({
      email: data.email,
      username: data.username,
      displayName: data.displayName || data.username,
      password: data.password,
      provider: AuthProvider.LOCAL,
      role: UserRole.USER,
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshTokenStr: string) {
    try {
      const decoded = jwt.verify(refreshTokenStr, config.jwt.refreshSecret) as { userId: string };
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new AppError('User not found', 401);
      }

      const accessToken = this.generateAccessToken(user.id);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  static async findOrCreateOAuthUser(data: {
    provider: AuthProvider;
    providerId: string;
    email: string;
    username: string;
    displayName: string;
    avatar?: string;
  }) {
    let user = await User.findOne({
      where: { provider: data.provider, providerId: data.providerId },
    });

    if (!user) {
      user = await User.findOne({ where: { email: data.email } });

      if (user) {
        // Link existing account with OAuth provider
        await user.update({
          provider: data.provider,
          providerId: data.providerId,
          avatar: data.avatar || user.avatar,
        });
      } else {
        // Create new user
        let username = data.username;
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
          username = `${username}_${Date.now()}`;
        }

        user = await User.create({
          email: data.email,
          username,
          displayName: data.displayName,
          avatar: data.avatar,
          provider: data.provider,
          providerId: data.providerId,
          isEmailVerified: true,
          role: UserRole.USER,
        });
      }
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return { user: user.toJSON(), accessToken, refreshToken };
  }
}
