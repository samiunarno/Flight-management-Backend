import mongoose, { Document, Schema } from 'mongoose';

export interface IAirline extends Document {
  name: string;
  code: string;
  country: string;
  createdAt: Date;
}

const airlineSchema = new Schema<IAirline>({
  name: {
    type: String,
    required: [true, 'Airline name is required'],
    trim: true,
    maxlength: [100, 'Airline name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Airline code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,3}$/, 'Airline code must be 2-3 uppercase letters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IAirline>('Airline', airlineSchema);