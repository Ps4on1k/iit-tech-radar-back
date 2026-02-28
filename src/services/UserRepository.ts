import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { AppDataSource } from '../database';
import type { Repository } from 'typeorm';

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

export class DatabaseUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.repository.findOne({ where: { email } });
    return result ?? undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | undefined> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updatePassword(id: string, newPassword: string): Promise<User | undefined> {
    return this.update(id, { password: bcrypt.hashSync(newPassword, 10) });
  }

  async findByEmailExcludeId(email: string, excludeId: string): Promise<User | undefined> {
    const result = await this.repository.findOne({ where: { email, id: excludeId } });
    return result ?? undefined;
  }
}

// Фабрика для создания репозитория
export function createUserRepository() {
  return new DatabaseUserRepository();
}
