import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class FlightController {
    static searchFlights(req: Request, res: Response): Promise<void>;
    static getFlightDetails(req: Request, res: Response): Promise<void>;
    static createFlight(req: AuthRequest, res: Response): Promise<void>;
    static updateFlight(req: AuthRequest, res: Response): Promise<void>;
    static deleteFlight(req: AuthRequest, res: Response): Promise<void>;
    static getFlightsByAirline(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=flightController.d.ts.map