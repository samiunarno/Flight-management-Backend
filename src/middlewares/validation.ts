import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

// Common validation schemas
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Airline Staff', 'Agent', 'Customer').optional()
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const flightSearchSchema = Joi.object({
  departureAirport: Joi.string().length(3).uppercase().required(),
  arrivalAirport: Joi.string().length(3).uppercase().required(),
  departureDate: Joi.date().min('now').required(),
  returnDate: Joi.date().min(Joi.ref('departureDate')).optional(),
  passengers: Joi.number().min(1).max(10).default(1),
  class: Joi.string().valid('Economy', 'Business', 'First').optional()
});

export const bookingSchema = Joi.object({
  flightId: Joi.string().required(),
  seatsBooked: Joi.number().min(1).max(10).required(),
  passengerDetails: Joi.array().items(
    Joi.object({
      name: Joi.string().min(2).max(100).required(),
      age: Joi.number().min(1).max(120).required(),
      gender: Joi.string().valid('Male', 'Female', 'Other').required()
    })
  ).min(1).max(10).required(),
  paymentMethod: Joi.string().valid('Credit Card', 'Debit Card', 'UPI', 'Net Banking').required()
});
