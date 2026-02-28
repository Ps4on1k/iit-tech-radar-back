import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { createUserRepository } from './UserRepository';
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
  user: Omit<JwtPayload, 'id'> & { id: string };
  token: string;
}

export class AuthService {
  private userRepository = createUserRepository();

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      return null;
    }
  }

  async validateUser(email: string, password: string): Promise<JwtPayload | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  async login(credentials: { email: string; password: string }): Promise<LoginResult> {
    const user = await this.validateUser(credentials.email, credentials.password);

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
  }): Promise<User> {
    // Проверка на уникальный email
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    return this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
    } as any);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    // Проверка на уникальный email (исключая текущего пользователя)
    if (userData.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Пользователь с таким email уже существует');
      }
    }
    return this.userRepository.update(id, userData as any);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  async changePassword(userId: string, newPassword: string): Promise<User | undefined> {
    return this.userRepository.updatePassword(userId, newPassword);
  }

  async setUserPassword(userId: string, newPassword: string): Promise<User | undefined> {
    // Админ может установить пароль пользователю без проверки старого
    return this.userRepository.updatePassword(userId, newPassword);
  }

  async toggleUserActive(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findById(id);
    if (!user) return undefined;
    return this.userRepository.update(id, { isActive: !user.isActive });
  }
}
