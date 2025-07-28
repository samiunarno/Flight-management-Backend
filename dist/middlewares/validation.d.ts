import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const userRegistrationSchema: Joi.ObjectSchema<any>;
export declare const userLoginSchema: Joi.ObjectSchema<any>;
export declare const flightSearchSchema: Joi.ObjectSchema<any>;
export declare const bookingSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map