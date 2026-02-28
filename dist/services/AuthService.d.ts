import type { User as DbUser } from '../models/User';
export type User = DbUser;
export interface JwtPayload {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}
export interface LoginResult {
    user: Omit<JwtPayload, 'id'> & {
        id: string;
    };
    token: string;
}
export declare class AuthService {
    private userRepository;
    generateToken(payload: JwtPayload): string;
    verifyToken(token: string): JwtPayload | null;
    validateUser(email: string, password: string): Promise<JwtPayload | null>;
    login(credentials: {
        email: string;
        password: string;
    }): Promise<LoginResult>;
    getUserById(id: string): Promise<User | undefined>;
    getAllUsers(): Promise<User[]>;
    createUser(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'admin' | 'user';
    }): Promise<User>;
    updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
    deleteUser(id: string): Promise<boolean>;
    changePassword(userId: string, newPassword: string): Promise<User | undefined>;
    setUserPassword(userId: string, newPassword: string): Promise<User | undefined>;
    toggleUserActive(id: string): Promise<User | undefined>;
}
//# sourceMappingURL=AuthService.d.ts.map