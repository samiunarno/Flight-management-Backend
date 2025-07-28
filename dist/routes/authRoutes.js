"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
router.post('/register', (0, validation_1.validate)(validation_1.userRegistrationSchema), authController_1.AuthController.register);
router.post('/login', (0, validation_1.validate)(validation_1.userLoginSchema), authController_1.AuthController.login);
router.get('/profile', auth_1.authenticate, authController_1.AuthController.getProfile);
router.post('/refresh-token', auth_1.authenticate, authController_1.AuthController.refreshToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map