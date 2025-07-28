"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSchema = exports.flightSearchSchema = exports.userLoginSchema = exports.userRegistrationSchema = exports.validateQuery = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errors = error.details.map(detail => detail.message);
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        if (error) {
            const errors = error.details.map(detail => detail.message);
            res.status(400).json({
                success: false,
                message: 'Query validation error',
                errors
            });
            return;
        }
        next();
    };
};
exports.validateQuery = validateQuery;
exports.userRegistrationSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string().valid('Admin', 'Airline Staff', 'Agent', 'Customer').optional()
});
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.flightSearchSchema = joi_1.default.object({
    departureAirport: joi_1.default.string().length(3).uppercase().required(),
    arrivalAirport: joi_1.default.string().length(3).uppercase().required(),
    departureDate: joi_1.default.date().min('now').required(),
    returnDate: joi_1.default.date().min(joi_1.default.ref('departureDate')).optional(),
    passengers: joi_1.default.number().min(1).max(10).default(1),
    class: joi_1.default.string().valid('Economy', 'Business', 'First').optional()
});
exports.bookingSchema = joi_1.default.object({
    flightId: joi_1.default.string().required(),
    seatsBooked: joi_1.default.number().min(1).max(10).required(),
    passengerDetails: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        age: joi_1.default.number().min(1).max(120).required(),
        gender: joi_1.default.string().valid('Male', 'Female', 'Other').required()
    })).min(1).max(10).required(),
    paymentMethod: joi_1.default.string().valid('Credit Card', 'Debit Card', 'UPI', 'Net Banking').required()
});
//# sourceMappingURL=validation.js.map