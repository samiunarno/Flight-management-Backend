import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class BookingController {
    static createBooking(req: AuthRequest, res: Response): Promise<void>;
    static confirmPayment(req: AuthRequest, res: Response): Promise<void>;
    static cancelBooking(req: AuthRequest, res: Response): Promise<void>;
    static getUserBookings(req: AuthRequest, res: Response): Promise<void>;
    static getBookingDetails(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=bookingController.d.ts.map