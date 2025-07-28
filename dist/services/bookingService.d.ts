import { IBooking } from '../models/Booking';
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
export declare class BookingService {
    static createBooking(bookingData: BookingData): Promise<IBooking>;
    static confirmPayment(bookingId: string, transactionId: string): Promise<IBooking>;
    static cancelBooking(bookingId: string, userId: string): Promise<boolean>;
    static getUserBookings(userId: string): Promise<IBooking[]>;
    static getBookingById(bookingId: string): Promise<IBooking | null>;
    private static releaseExpiredReservation;
    private static sendBookingConfirmationEmail;
    static getUpcomingFlights(): Promise<any[]>;
}
//# sourceMappingURL=bookingService.d.ts.map