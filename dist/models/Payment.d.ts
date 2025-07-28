import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    bookingId: mongoose.Types.ObjectId;
    amount: number;
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    transactionId: string;
    paymentMethod: 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking';
    createdAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}> & IPayment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Payment.d.ts.map