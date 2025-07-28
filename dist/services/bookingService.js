"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Flight_1 = __importDefault(require("../models/Flight"));
const Payment_1 = __importDefault(require("../models/Payment"));
const env_1 = require("../config/env");
const uuid_1 = require("uuid");
const email_1 = require("../utils/email");
class BookingService {
    static async createBooking(bookingData) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const { userId, flightId, seatsBooked, passengerDetails, paymentMethod } = bookingData;
            const flight = await Flight_1.default.findById(flightId).session(session);
            if (!flight) {
                throw new Error('Flight not found');
            }
            if (flight.seatsAvailable < seatsBooked) {
                throw new Error('Not enough seats available');
            }
            if (flight.status !== 'Scheduled') {
                throw new Error('Flight is not available for booking');
            }
            if (new Date(flight.departureTime) <= new Date()) {
                throw new Error('Cannot book flights that have already departed');
            }
            await Flight_1.default.findByIdAndUpdate(flightId, { $inc: { seatsAvailable: -seatsBooked } }, { session });
            const reservationExpiry = new Date(Date.now() + env_1.config.reservationTimeout * 60 * 1000);
            const totalAmount = flight.price * seatsBooked;
            const booking = new Booking_1.default({
                userId,
                flightId,
                seatsBooked,
                status: 'Pending',
                paymentStatus: 'Pending',
                reservationExpiry,
                totalAmount,
                passengerDetails,
            });
            await booking.save({ session });
            const payment = new Payment_1.default({
                bookingId: booking._id,
                amount: totalAmount,
                status: 'Pending',
                transactionId: (0, uuid_1.v4)(),
                paymentMethod,
            });
            await payment.save({ session });
            await session.commitTransaction();
            const bookingId = booking._id.toString();
            setTimeout(async () => {
                await this.releaseExpiredReservation(bookingId);
            }, env_1.config.reservationTimeout * 60 * 1000);
            return booking;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async confirmPayment(bookingId, transactionId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const booking = await Booking_1.default.findById(bookingId).session(session);
            if (!booking) {
                throw new Error('Booking not found');
            }
            if (booking.status !== 'Pending') {
                throw new Error('Booking is not in pending status');
            }
            if (new Date() > booking.reservationExpiry) {
                throw new Error('Reservation has expired');
            }
            booking.status = 'Confirmed';
            booking.paymentStatus = 'Completed';
            await booking.save({ session });
            await Payment_1.default.findOneAndUpdate({ bookingId: booking._id }, { status: 'Completed', transactionId }, { session });
            await session.commitTransaction();
            const populatedBooking = await Booking_1.default.findById(bookingId)
                .populate('userId', 'name email')
                .populate('flightId', 'flightNumber departureAirport arrivalAirport departureTime');
            if (populatedBooking) {
                await this.sendBookingConfirmationEmail(populatedBooking);
            }
            return booking;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async cancelBooking(bookingId, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const booking = await Booking_1.default.findOne({ _id: bookingId, userId }).session(session);
            if (!booking) {
                throw new Error('Booking not found');
            }
            if (booking.status === 'Cancelled') {
                throw new Error('Booking is already cancelled');
            }
            const flight = await Flight_1.default.findById(booking.flightId).session(session);
            if (!flight) {
                throw new Error('Flight not found');
            }
            const hoursUntilDeparture = (new Date(flight.departureTime).getTime() - Date.now()) / (1000 * 60 * 60);
            if (hoursUntilDeparture < 24) {
                throw new Error('Cannot cancel booking less than 24 hours before departure');
            }
            await Flight_1.default.findByIdAndUpdate(booking.flightId, { $inc: { seatsAvailable: booking.seatsBooked } }, { session });
            booking.status = 'Cancelled';
            if (booking.paymentStatus === 'Completed') {
                booking.paymentStatus = 'Refunded';
            }
            await booking.save({ session });
            await Payment_1.default.findOneAndUpdate({ bookingId: booking._id }, { status: booking.paymentStatus === 'Refunded' ? 'Refunded' : 'Failed' }, { session });
            await session.commitTransaction();
            return true;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async getUserBookings(userId) {
        return Booking_1.default.find({ userId })
            .populate('flightId', 'flightNumber departureAirport arrivalAirport departureTime arrivalTime')
            .populate({
            path: 'flightId',
            populate: { path: 'airlineId', select: 'name code' },
        })
            .sort('-createdAt');
    }
    static async getBookingById(bookingId) {
        return Booking_1.default.findById(bookingId)
            .populate('userId', 'name email')
            .populate('flightId')
            .populate({
            path: 'flightId',
            populate: { path: 'airlineId', select: 'name code' },
        });
    }
    static async releaseExpiredReservation(bookingId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const booking = await Booking_1.default.findById(bookingId).session(session);
            if (!booking || booking.status !== 'Pending' || booking.paymentStatus === 'Completed') {
                await session.commitTransaction();
                return;
            }
            if (new Date() <= booking.reservationExpiry) {
                await session.commitTransaction();
                return;
            }
            await Flight_1.default.findByIdAndUpdate(booking.flightId, { $inc: { seatsAvailable: booking.seatsBooked } }, { session });
            booking.status = 'Expired';
            booking.paymentStatus = 'Failed';
            await booking.save({ session });
            await Payment_1.default.findOneAndUpdate({ bookingId: booking._id }, { status: 'Failed' }, { session });
            await session.commitTransaction();
            console.log(`Released expired reservation for booking ${bookingId}`);
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error releasing expired reservation:', error);
        }
        finally {
            session.endSession();
        }
    }
    static async sendBookingConfirmationEmail(booking) {
        try {
            const bookingDetails = {
                bookingId: booking._id.toString(),
                passengerName: booking.userId.name,
                flightNumber: booking.flightId.flightNumber,
                route: `${booking.flightId.departureAirport} → ${booking.flightId.arrivalAirport}`,
                departureTime: booking.flightId.departureTime.toLocaleString(),
                seatsBooked: booking.seatsBooked,
                totalAmount: booking.totalAmount,
            };
            await (0, email_1.sendBookingConfirmation)(booking.userId.email, bookingDetails);
        }
        catch (error) {
            console.error('Error sending booking confirmation email:', error);
        }
    }
    static async getUpcomingFlights() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        return Booking_1.default.find({
            status: 'Confirmed',
            'flightId.departureTime': { $gte: tomorrow, $lt: dayAfterTomorrow },
        })
            .populate('userId', 'name email')
            .populate('flightId', 'flightNumber departureAirport arrivalAirport departureTime');
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=bookingService.js.map