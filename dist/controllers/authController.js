"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            const result = await authService_1.AuthService.register({ name, email, password, role });
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
            });
        }
        catch (error) {
            const err = error;
            return res.status(400).json({
                success: false,
                message: err.message || 'Registration failed',
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.AuthService.login(email, password);
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            const err = error;
            return res.status(401).json({
                success: false,
                message: err.message || 'Login failed',
            });
        }
    }
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }
            const userId = req.user._id.toString();
            const user = await authService_1.AuthService.getUserById(userId);
            return res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: { user },
            });
        }
        catch (error) {
            const err = error;
            return res.status(500).json({
                success: false,
                message: err.message || 'Failed to retrieve profile',
            });
        }
    }
    static async refreshToken(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }
            const userId = req.user._id.toString();
            const token = authService_1.AuthService.generateToken(userId, req.user.role);
            return res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: { token },
            });
        }
        catch (error) {
            const err = error;
            return res.status(500).json({
                success: false,
                message: err.message || 'Token refresh failed',
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map