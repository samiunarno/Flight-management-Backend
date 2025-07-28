import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('Admin'));

// User Management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);
router.delete('/users/:userId', AdminController.deleteUser);

// Airline Management
router.post('/airlines', AdminController.createAirline);
router.get('/airlines', AdminController.getAllAirlines);
router.put('/airlines/:airlineId', AdminController.updateAirline);
router.delete('/airlines/:airlineId', AdminController.deleteAirline);

// Reports
router.get('/reports/bookings', AdminController.getBookingReports);
router.get('/reports/revenue', AdminController.getRevenueReports);
router.get('/reports/users', AdminController.getUserStats);

export default router;