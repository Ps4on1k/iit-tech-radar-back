import { DatabaseUserRepository, createUserRepository } from '../../services/UserRepository';
import { User, UserRole } from '../../models/User';
import { AppDataSource } from '../../database';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

// Mock для bcrypt
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((str: string) => `hashed_${str}`),
  compare: jest.fn(),
  genSaltSync: jest.fn(),
}));

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('DatabaseUserRepository', () => {
  let repository: DatabaseUserRepository;
  let mockTypeormRepository: Partial<Repository<User>>;

  beforeEach(() => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);
    repository = new DatabaseUserRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('должен находить пользователя по email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('должен возвращать undefined если пользователь не найден', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('должен находить пользователя по id', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById('1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockUser);
    });

    it('должен возвращать undefined если пользователь не найден', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('должен возвращать всех пользователей', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ] as User[];
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(mockTypeormRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('должен возвращать пустой массив если пользователей нет', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('должен создавать нового пользователя', async () => {
      const userData = { email: 'test@example.com', firstName: 'John' };
      const mockCreatedUser = { id: '1', ...userData } as User;

      (mockTypeormRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
      (mockTypeormRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await repository.create(userData);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(userData);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('update', () => {
    it('должен обновлять пользователя', async () => {
      const userData = { firstName: 'Updated' };
      const mockUpdatedUser = { id: '1', ...userData } as User;

      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update('1', userData);

      expect(mockTypeormRepository.update).toHaveBeenCalledWith('1', userData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('должен возвращать undefined если пользователь не найден после обновления', async () => {
      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.update('1', { firstName: 'Updated' });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('должен возвращать true при успешном удалении', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.delete('1');

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('должен возвращать false если пользователь не найден', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      const result = await repository.delete('999');

      expect(result).toBe(false);
    });

    it('должен возвращать false если affected undefined', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: undefined });

      const result = await repository.delete('1');

      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('должен обновлять пароль пользователя', async () => {
      const mockUpdatedUser = { id: '1', email: 'test@example.com' } as User;

      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed_newpassword');

      const result = await repository.updatePassword('1', 'newpassword');

      expect(mockTypeormRepository.update).toHaveBeenCalledWith('1', { password: 'hashed_newpassword' });
      expect(bcrypt.hashSync).toHaveBeenCalledWith('newpassword', 10);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('findByEmailExcludeId', () => {
    it('должен находить пользователя по email исключая id', async () => {
      const mockUser = { id: '2', email: 'test@example.com' } as User;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmailExcludeId('test@example.com', '1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com', id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('должен возвращать undefined если пользователь не найден', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByEmailExcludeId('test@example.com', '1');

      expect(result).toBeUndefined();
    });
  });
});

describe('createUserRepository', () => {
  it('должен создавать экземпляр DatabaseUserRepository', () => {
    const result = createUserRepository();

    expect(result).toBeInstanceOf(DatabaseUserRepository);
  });
});
