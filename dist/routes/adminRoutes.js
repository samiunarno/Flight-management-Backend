"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('Admin'));
router.get('/users', adminController_1.AdminController.getAllUsers);
router.put('/users/:userId/role', adminController_1.AdminController.updateUserRole);
router.delete('/users/:userId', adminController_1.AdminController.deleteUser);
router.post('/airlines', adminController_1.AdminController.createAirline);
router.get('/airlines', adminController_1.AdminController.getAllAirlines);
router.put('/airlines/:airlineId', adminController_1.AdminController.updateAirline);
router.delete('/airlines/:airlineId', adminController_1.AdminController.deleteAirline);
router.get('/reports/bookings', adminController_1.AdminController.getBookingReports);
router.get('/reports/revenue', adminController_1.AdminController.getRevenueReports);
router.get('/reports/users', adminController_1.AdminController.getUserStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map