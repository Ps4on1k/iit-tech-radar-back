import { User, UserRole } from '../models/User';
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface DbUser {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class DatabaseUserRepository {
    private repository;
    constructor();
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    findAll(): Promise<User[]>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User | undefined>;
    delete(id: string): Promise<boolean>;
    updatePassword(id: string, newPassword: string): Promise<User | undefined>;
    findByEmailExcludeId(email: string, excludeId: string): Promise<User | undefined>;
}
export declare function createUserRepository(): DatabaseUserRepository;
//# sourceMappingURL=UserRepository.d.ts.map