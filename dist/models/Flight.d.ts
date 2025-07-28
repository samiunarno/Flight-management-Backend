import mongoose, { Document } from 'mongoose';
export interface IFlight extends Document {
    airlineId: mongoose.Types.ObjectId;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: Date;
    arrivalTime: Date;
    price: number;
    seatsAvailable: number;
    totalSeats: number;
    class: 'Economy' | 'Business' | 'First';
    status: 'Scheduled' | 'Delayed' | 'Cancelled' | 'Completed';
    createdAt: Date;
}
declare const _default: mongoose.Model<IFlight, {}, {}, {}, mongoose.Document<unknown, {}, IFlight, {}> & IFlight & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Flight.d.ts.map