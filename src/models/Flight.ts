import mongoose, { Document, Schema } from 'mongoose';

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

const flightSchema = new Schema<IFlight>({
  airlineId: {
    type: Schema.Types.ObjectId,
    ref: 'Airline',
    required: [true, 'Airline ID is required']
  },
  flightNumber: {
    type: String,
    required: [true, 'Flight number is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,3}\d{3,4}$/, 'Flight number format: AA123 or AAA1234']
  },
  departureAirport: {
    type: String,
    required: [true, 'Departure airport is required'],
    uppercase: true,
    match: [/^[A-Z]{3}$/, 'Airport code must be 3 uppercase letters']
  },
  arrivalAirport: {
    type: String,
    required: [true, 'Arrival airport is required'],
    uppercase: true,
    match: [/^[A-Z]{3}$/, 'Airport code must be 3 uppercase letters']
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Arrival time is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  seatsAvailable: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1']
  },
  class: {
    type: String,
    enum: ['Economy', 'Business', 'First'],
    default: 'Economy'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Delayed', 'Cancelled', 'Completed'],
    default: 'Scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate arrival time is after departure time
flightSchema.pre('save', function(next) {
  if (this.arrivalTime <= this.departureTime) {
    return next(new Error('Arrival time must be after departure time'));
  }
  
  if (this.seatsAvailable > this.totalSeats) {
    return next(new Error('Available seats cannot exceed total seats'));
  }
  
  next();
});

export default mongoose.model<IFlight>('Flight', flightSchema);