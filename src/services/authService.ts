import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { config } from '../config/env';
import { Types } from 'mongoose';

export interface LoginResult {
  user: Omit<IUser, 'passwordHash'>;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export class AuthService {
  static generateToken(userId: string, role: string): string {
    const payload = { userId, role };
    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn']
    };
    return jwt.sign(payload, config.jwtSecret as string, options);
  }

  static async register(userData: RegisterData): Promise<LoginResult> {
    const { name, email, password, role = 'Customer' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: password, // hashed by pre-save middleware
      role,
    });

    await user.save();

    // Generate token
    const token = this.generateToken((user._id as Types.ObjectId).toString(), user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).passwordHash;

    return {
      user: userResponse as Omit<IUser, 'passwordHash'>,
      token,
    };
  }

  static async login(email: string, password: string): Promise<LoginResult> {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken((user._id as Types.ObjectId).toString(), user.role);

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).passwordHash;

    return {
      user: userResponse as Omit<IUser, 'passwordHash'>,
      token,
    };
  }

  static async getUserById(userId: string): Promise<Omit<IUser, 'passwordHash'> | null> {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
  }
}
