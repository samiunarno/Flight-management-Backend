import mongoose, { Types } from 'mongoose';
import Booking, { IBooking } from '../models/Booking';
import Flight from '../models/Flight';
import Payment from '../models/Payment';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import { sendBookingConfirmation } from '../utils/email';

export interface BookingData {
  userId: string;
  flightId: string;
  seatsBooked: number;
  passengerDetails: Array<{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
  }>;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking';
}

export class BookingService {
  static async createBooking(bookingData: BookingData): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, flightId, seatsBooked, passengerDetails, paymentMethod } = bookingData;

      // Check flight availability
      const flight = await Flight.findById(flightId).session(session);
      if (!flight) {
        throw new Error('Flight not found');
      }

      if (flight.seatsAvailable < seatsBooked) {
        throw new Error('Not enough seats available');
      }

      if (flight.status !== 'Scheduled') {
        throw new Error('Flight is not available for booking');
      }

      // Check if flight departure is in the future
      if (new Date(flight.departureTime) <= new Date()) {
        throw new Error('Cannot book flights that have already departed');
      }

      // Reserve seats
      await Flight.findByIdAndUpdate(
        flightId,
        { $inc: { seatsAvailable: -seatsBooked } },
        { session }
      );

      // Create booking with reservation expiry
      const reservationExpiry = new Date(Date.now() + config.reservationTimeout * 60 * 1000);
      const totalAmount = flight.price * seatsBooked;

      const booking = new Booking({
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

      // Create payment record
      const payment = new Payment({
        bookingId: booking._id,
        amount: totalAmount,
        status: 'Pending',
        transactionId: uuidv4(),
        paymentMethod,
      });

      await payment.save({ session });

      await session.commitTransaction();

      // Schedule automatic seat release if payment not completed
      const bookingId = (booking._id as Types.ObjectId).toString();
      setTimeout(async () => {
        await this.releaseExpiredReservation(bookingId);
      }, config.reservationTimeout * 60 * 1000);

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async confirmPayment(bookingId: string, transactionId: string): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'Pending') {
        throw new Error('Booking is not in pending status');
      }

      if (new Date() > booking.reservationExpiry) {
        throw new Error('Reservation has expired');
      }

      // Update booking status
      booking.status = 'Confirmed';
      booking.paymentStatus = 'Completed';
      await booking.save({ session });

      // Update payment record
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'Completed', transactionId },
        { session }
      );

      await session.commitTransaction();

      // Send confirmation email
      const populatedBooking = await Booking.findById(bookingId)
        .populate('userId', 'name email')
        .populate('flightId', 'flightNumber departureAirport arrivalAirport departureTime');

      if (populatedBooking) {
        await this.sendBookingConfirmationEmail(populatedBooking);
      }

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async cancelBooking(bookingId: string, userId: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findOne({ _id: bookingId, userId }).session(session);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === 'Cancelled') {
        throw new Error('Booking is already cancelled');
      }

      const flight = await Flight.findById(booking.flightId).session(session);
      if (!flight) {
        throw new Error('Flight not found');
      }

      const hoursUntilDeparture =
        (new Date(flight.departureTime).getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDeparture < 24) {
        throw new Error('Cannot cancel booking less than 24 hours before departure');
      }

      // Release seats
      await Flight.findByIdAndUpdate(
        booking.flightId,
        { $inc: { seatsAvailable: booking.seatsBooked } },
        { session }
      );

      // Update booking status
      booking.status = 'Cancelled';
      if (booking.paymentStatus === 'Completed') {
        booking.paymentStatus = 'Refunded';
      }
      await booking.save({ session });

      // Update payment record
      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        { status: booking.paymentStatus === 'Refunded' ? 'Refunded' : 'Failed' },
        { session }
      );

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getUserBookings(userId: string): Promise<IBooking[]> {
    return Booking.find({ userId })
      .populate('flightId', 'flightNumber departureAirport arrivalAirport departureTime arrivalTime')
      .populate({
        path: 'flightId',
        populate: { path: 'airlineId', select: 'name code' },
      })
      .sort('-createdAt');
  }

  static async getBookingById(bookingId: string): Promise<IBooking | null> {
    return Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('flightId')
      .populate({
        path: 'flightId',
        populate: { path: 'airlineId', select: 'name code' },
      });
  }

  private static async releaseExpiredReservation(bookingId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking || booking.status !== 'Pending' || booking.paymentStatus === 'Completed') {
        await session.commitTransaction();
        return;
      }

      // Check if reservation has expired
      if (new Date() <= booking.reservationExpiry) {
        await session.commitTransaction();
        return;
      }

      // Release seats
      await Flight.findByIdAndUpdate(
        booking.flightId,
        { $inc: { seatsAvailable: booking.seatsBooked } },
        { session }
      );

      // Update booking status
      booking.status = 'Expired';
      booking.paymentStatus = 'Failed';
      await booking.save({ session });

      await Payment.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'Failed' },
        { session }
      );

      await session.commitTransaction();
      console.log(`Released expired reservation for booking ${bookingId}`);
    } catch (error) {
      await session.abortTransaction();
      console.error('Error releasing expired reservation:', error);
    } finally {
      session.endSession();
    }
  }

  private static async sendBookingConfirmationEmail(booking: any): Promise<void> {
    try {
      const bookingDetails = {
        bookingId: (booking._id as Types.ObjectId).toString(),
        passengerName: booking.userId.name,
        flightNumber: booking.flightId.flightNumber,
        route: `${booking.flightId.departureAirport} → ${booking.flightId.arrivalAirport}`,
        departureTime: booking.flightId.departureTime.toLocaleString(),
        seatsBooked: booking.seatsBooked,
        totalAmount: booking.totalAmount,
      };

      await sendBookingConfirmation(booking.userId.email, bookingDetails);
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
    }
  }

  static async getUpcomingFlights(): Promise<any[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    return Booking.find({
      status: 'Confirmed',
      'flightId.departureTime': { $gte: tomorrow, $lt: dayAfterTomorrow },
    })
      .populate('userId', 'name email')
      .populate('flightId', 'flightNumber departureAirport arrivalAirport departureTime');
  }
}
