import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middlewares/auth';
import { Types } from 'mongoose';

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role } = req.body;

      const result = await AuthService.register({ name, email, password, role });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(400).json({
        success: false,
        message: err.message || 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(401).json({
        success: false,
        message: err.message || 'Login failed',
      });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const userId = (req.user._id as Types.ObjectId).toString();
      const user = await AuthService.getUserById(userId);

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve profile',
      });
    }
  }

  static async refreshToken(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const userId = (req.user._id as Types.ObjectId).toString();
      const token = AuthService.generateToken(userId, req.user.role);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token },
      });
    } catch (error: unknown) {
      const err = error as Error;
      return res.status(500).json({
        success: false,
        message: err.message || 'Token refresh failed',
      });
    }
  }
}
