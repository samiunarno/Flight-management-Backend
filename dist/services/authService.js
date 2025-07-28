"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const env_1 = require("../config/env");
class AuthService {
    static generateToken(userId, role) {
        const payload = { userId, role };
        const options = {
            expiresIn: env_1.config.jwtExpiresIn
        };
        return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, options);
    }
    static async register(userData) {
        const { name, email, password, role = 'Customer' } = userData;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const user = new User_1.default({
            name,
            email,
            passwordHash: password,
            role,
        });
        await user.save();
        const token = this.generateToken(user._id.toString(), user.role);
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        return {
            user: userResponse,
            token,
        };
    }
    static async login(email, password) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = this.generateToken(user._id.toString(), user.role);
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        return {
            user: userResponse,
            token,
        };
    }
    static async getUserById(userId) {
        const user = await User_1.default.findById(userId).select('-passwordHash');
        return user;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map