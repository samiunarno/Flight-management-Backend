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
const flightSchema = new mongoose_1.Schema({
    airlineId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
flightSchema.pre('save', function (next) {
    if (this.arrivalTime <= this.departureTime) {
        return next(new Error('Arrival time must be after departure time'));
    }
    if (this.seatsAvailable > this.totalSeats) {
        return next(new Error('Available seats cannot exceed total seats'));
    }
    next();
});
exports.default = mongoose_1.default.model('Flight', flightSchema);
//# sourceMappingURL=Flight.js.map