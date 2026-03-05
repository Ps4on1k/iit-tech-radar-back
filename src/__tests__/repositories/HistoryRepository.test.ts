import { HistoryRepository } from '../../repositories/HistoryRepository';
import { TechRadarHistoryEntity } from '../../models/TechRadarHistoryEntity';
import { AppDataSource } from '../../database';
import { Repository } from 'typeorm';

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('HistoryRepository', () => {
  let repository: HistoryRepository;
  let mockTypeormRepository: Partial<Repository<TechRadarHistoryEntity>>;

  beforeEach(() => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);
    repository = new HistoryRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('должен находить запись истории по id', async () => {
      const mockHistory = { id: '1', action: 'UPDATE' } as TechRadarHistoryEntity;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockHistory);

      const result = await repository.findById('1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockHistory);
    });

    it('должен возвращать undefined если запись не найдена', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('findByTechRadarId', () => {
    it('должен находить записи истории технологии', async () => {
      const mockHistory = [
        { id: '1', action: 'CREATE', techRadarId: 'tech-123' },
        { id: '2', action: 'UPDATE', techRadarId: 'tech-123' },
      ] as TechRadarHistoryEntity[];
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue(mockHistory);

      const result = await repository.findByTechRadarId('tech-123');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { techRadarId: 'tech-123' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockHistory);
    });

    it('должен использовать кастомный limit', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      await repository.findByTechRadarId('tech-123', 10);

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { techRadarId: 'tech-123' },
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });

    it('должен возвращать пустой массив если записей нет', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByTechRadarId('tech-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('должен создавать запись истории', async () => {
      const data: any = { action: 'UPDATE' as const, techRadarId: 'tech-123', changes: { name: 'New Name' } };
      const mockHistory: any = { id: '1', ...data };

      (mockTypeormRepository.create as jest.Mock).mockReturnValue(mockHistory);
      (mockTypeormRepository.save as jest.Mock).mockResolvedValue(mockHistory);

      const result = await repository.create(data);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockHistory);
      expect(result).toEqual(mockHistory);
    });
  });
});
