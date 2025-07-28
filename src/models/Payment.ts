import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId: string;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking';
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'],
    required: [true, 'Payment method is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IPayment>('Payment', paymentSchema);