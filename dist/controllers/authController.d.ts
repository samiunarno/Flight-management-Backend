import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response>;
    static login(req: Request, res: Response): Promise<Response>;
    static getProfile(req: AuthRequest, res: Response): Promise<Response>;
    static refreshToken(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=authController.d.ts.map