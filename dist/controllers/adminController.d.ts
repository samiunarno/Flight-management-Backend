import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class AdminController {
    static getAllUsers(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateUserRole(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static createAirline(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAllAirlines(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateAirline(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteAirline(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookingReports(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getRevenueReports(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUserStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=adminController.d.ts.map