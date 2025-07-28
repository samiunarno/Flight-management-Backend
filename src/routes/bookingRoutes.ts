import express from 'express';
import { BookingController } from '../controllers/bookingController';
import { authenticate } from '../middlewares/auth';
import { validate, bookingSchema } from '../middlewares/validation';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', validate(bookingSchema), BookingController.createBooking);
router.post('/:bookingId/confirm-payment', BookingController.confirmPayment);
router.put('/:bookingId/cancel', BookingController.cancelBooking);
router.get('/', BookingController.getUserBookings);
router.get('/:bookingId', BookingController.getBookingDetails);

export default router;