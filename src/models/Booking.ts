import mongoose, { Document, Schema } from 'mongoose';

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

const bookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  flightId: {
    type: Schema.Types.ObjectId,
    ref: 'Flight',
    required: [true, 'Flight ID is required']
  },
  seatsBooked: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'At least 1 seat must be booked'],
    max: [10, 'Cannot book more than 10 seats at once']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Expired'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  reservationExpiry: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  passengerDetails: [{
    name: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Passenger age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    seatNumber: {
      type: String,
      match: [/^[A-Z]\d{1,2}$/, 'Seat number format: A1, B12, etc.']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate passenger details count matches seats booked
bookingSchema.pre('save', function(next) {
  if (this.passengerDetails.length !== this.seatsBooked) {
    return next(new Error('Passenger details count must match seats booked'));
  }
  next();
});

export default mongoose.model<IBooking>('Booking', bookingSchema);