import { TagRepository } from '../../repositories/TagRepository';
import { TechRadarTagEntity } from '../../models/TechRadarTagEntity';
import { AppDataSource } from '../../database';
import { Repository } from 'typeorm';

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('TagRepository', () => {
  let repository: TagRepository;
  let mockTypeormRepository: Partial<Repository<TechRadarTagEntity>>;

  beforeEach(() => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);
    repository = new TagRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('должен находить тег по id', async () => {
      const mockTag = { id: '1', name: 'Test' } as TechRadarTagEntity;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockTag);

      const result = await repository.findById('1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockTag);
    });

    it('должен возвращать undefined если тег не найден', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('findByTechRadarId', () => {
    it('должен находить теги технологии', async () => {
      const mockTags = [
        { id: '1', name: 'Tag1', techRadarId: 'tech-123' },
        { id: '2', name: 'Tag2', techRadarId: 'tech-123' },
      ] as TechRadarTagEntity[];
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue(mockTags);

      const result = await repository.findByTechRadarId('tech-123');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { techRadarId: 'tech-123' },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockTags);
    });

    it('должен возвращать пустой массив если тегов нет', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByTechRadarId('tech-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('должен создавать тег', async () => {
      const data = { name: 'Test', techRadarId: 'tech-123' };
      const mockTag = { id: '1', ...data } as TechRadarTagEntity;

      (mockTypeormRepository.create as jest.Mock).mockReturnValue(mockTag);
      (mockTypeormRepository.save as jest.Mock).mockResolvedValue(mockTag);

      const result = await repository.create(data);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockTag);
      expect(result).toEqual(mockTag);
    });
  });

  describe('delete', () => {
    it('должен возвращать true при успешном удалении', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.delete('1');

      expect(result).toBe(true);
    });

    it('должен возвращать false если тег не найден', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      const result = await repository.delete('999');

      expect(result).toBe(false);
    });
  });

  describe('deleteByTechRadarId', () => {
    it('должен удалять все теги технологии', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 3 });

      await repository.deleteByTechRadarId('tech-123');

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith({ techRadarId: 'tech-123' });
    });
  });

  describe('addTags', () => {
    it('должен добавлять новые теги', async () => {
      const tags = ['Tag1', 'Tag2'];
      const mockCreatedTags = tags.map((name, i) => ({
        id: `${i + 1}`,
        name,
        techRadarId: 'tech-123',
      })) as TechRadarTagEntity[];

      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      (mockTypeormRepository.create as jest.Mock).mockImplementation((data) => data);
      (mockTypeormRepository.save as jest.Mock).mockImplementation(async (data) => ({
        id: `${Date.now()}`,
        ...data,
      }));

      const result = await repository.addTags('tech-123', tags);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith({ techRadarId: 'tech-123' });
      expect(result.length).toBe(2);
      expect(result.map((t) => t.name)).toEqual(tags);
    });

    it('должен игнорировать пустые теги', async () => {
      const tags = ['Tag1', '', '  ', 'Tag2'];

      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      (mockTypeormRepository.create as jest.Mock).mockImplementation((data) => data);
      (mockTypeormRepository.save as jest.Mock).mockImplementation(async (data) => ({
        id: `${Date.now()}`,
        ...data,
      }));

      const result = await repository.addTags('tech-123', tags);

      expect(result.length).toBe(2);
    });

    it('должен удалять старые теги перед добавлением новых', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 2 });
      (mockTypeormRepository.create as jest.Mock).mockImplementation((data) => data);
      (mockTypeormRepository.save as jest.Mock).mockImplementation(async (data) => ({
        id: `${Date.now()}`,
        ...data,
      }));

      await repository.addTags('tech-123', ['NewTag']);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith({ techRadarId: 'tech-123' });
    });
  });
});
