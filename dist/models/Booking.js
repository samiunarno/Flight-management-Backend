"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    flightId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
bookingSchema.pre('save', function (next) {
    if (this.passengerDetails.length !== this.seatsBooked) {
        return next(new Error('Passenger details count must match seats booked'));
    }
    next();
});
exports.default = mongoose_1.default.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map