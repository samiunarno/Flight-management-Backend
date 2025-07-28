import { IUser } from '../models/User';
export interface LoginResult {
    user: Omit<IUser, 'passwordHash'>;
    token: string;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: string;
}
export declare class AuthService {
    static generateToken(userId: string, role: string): string;
    static register(userData: RegisterData): Promise<LoginResult>;
    static login(email: string, password: string): Promise<LoginResult>;
    static getUserById(userId: string): Promise<Omit<IUser, 'passwordHash'> | null>;
}
//# sourceMappingURL=authService.d.ts.map