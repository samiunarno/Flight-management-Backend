"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const bookingService_1 = require("../services/bookingService");
class BookingController {
    static async createBooking(req, res) {
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
            const booking = await bookingService_1.BookingService.createBooking(bookingData);
            res.status(201).json({
                success: true,
                message: 'Booking created successfully. Please complete payment within 10 minutes.',
                data: {
                    booking,
                    paymentDeadline: booking.reservationExpiry
                }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create booking'
            });
        }
    }
    static async confirmPayment(req, res) {
        try {
            const { bookingId } = req.params;
            const { transactionId } = req.body;
            const booking = await bookingService_1.BookingService.confirmPayment(bookingId, transactionId);
            res.status(200).json({
                success: true,
                message: 'Payment confirmed successfully. Booking is now confirmed.',
                data: { booking }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to confirm payment'
            });
        }
    }
    static async cancelBooking(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }
            const { bookingId } = req.params;
            const cancelled = await bookingService_1.BookingService.cancelBooking(bookingId, req.user.toObject.toString());
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to cancel booking'
            });
        }
    }
    static async getUserBookings(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }
            const bookings = await bookingService_1.BookingService.getUserBookings(req.user.toObject.toString());
            res.status(200).json({
                success: true,
                message: 'User bookings retrieved successfully',
                data: { bookings }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve bookings'
            });
        }
    }
    static async getBookingDetails(req, res) {
        try {
            const { bookingId } = req.params;
            const booking = await bookingService_1.BookingService.getBookingById(bookingId);
            if (!booking) {
                res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
                return;
            }
            const bookingUserId = booking.userId?._id?.toString();
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve booking details'
            });
        }
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=bookingController.js.map