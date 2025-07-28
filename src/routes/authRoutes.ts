import express from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate, userRegistrationSchema, userLoginSchema } from '../middlewares/validation';

const router = express.Router();

// Public routes
router.post('/register', validate(userRegistrationSchema), AuthController.register);
router.post('/login', validate(userLoginSchema), AuthController.login);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/refresh-token', authenticate, AuthController.refreshToken);

export default router;