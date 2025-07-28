import mongoose, { Document } from 'mongoose';
export interface IBooking extends Document {
    userId: mongoose.Types.ObjectId;
    flightId: mongoose.Types.ObjectId;
    seatsBooked: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';
    paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    reservationExpiry: Date;
    totalAmount: number;
    passengerDetails: Array<{
        name: string;
        age: number;
        gender: 'Male' | 'Female' | 'Other';
        seatNumber?: string;
    }>;
    createdAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}> & IBooking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map