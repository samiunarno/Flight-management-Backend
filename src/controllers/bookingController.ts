import { Response } from 'express';
import { BookingService } from '../services/bookingService';
import { AuthRequest } from '../middlewares/auth';

export class BookingController {
  static async createBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const bookingData = {
        userId: req.user.toObject.toString(),
        ...req.body
      };

      const booking = await BookingService.createBooking(bookingData);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully. Please complete payment within 10 minutes.',
        data: {
          booking,
          paymentDeadline: booking.reservationExpiry
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create booking'
      });
    }
  }

  static async confirmPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { transactionId } = req.body;

      const booking = await BookingService.confirmPayment(bookingId, transactionId);

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully. Booking is now confirmed.',
        data: { booking }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to confirm payment'
      });
    }
  }

  static async cancelBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { bookingId } = req.params;

      const cancelled = await BookingService.cancelBooking(bookingId, req.user.toObject.toString());

      if (!cancelled) {
        res.status(400).json({
          success: false,
          message: 'Failed to cancel booking'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel booking'
      });
    }
  }

  static async getUserBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const bookings = await BookingService.getUserBookings(req.user.toObject.toString());

      res.status(200).json({
        success: true,
        message: 'User bookings retrieved successfully',
        data: { bookings }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve bookings'
      });
    }
  }

  static async getBookingDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      const booking = await BookingService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      // যেহেতু booking.userId এর টাইপ অস্পষ্ট, তাই 'as any' দিয়ে কাস্ট করছি
      const bookingUserId = (booking.userId as any)?._id?.toString();

      if (req.user && req.user.role !== 'Admin' && bookingUserId !== req.user.toObject()._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking details retrieved successfully',
        data: { booking }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve booking details'
      });
    }
  }
}
