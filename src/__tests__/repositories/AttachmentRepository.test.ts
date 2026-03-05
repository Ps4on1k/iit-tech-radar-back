import { AttachmentRepository } from '../../repositories/AttachmentRepository';
import { TechRadarAttachmentEntity } from '../../models/TechRadarAttachmentEntity';
import { AppDataSource } from '../../database';
import { Repository } from 'typeorm';

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('AttachmentRepository', () => {
  let repository: AttachmentRepository;
  let mockTypeormRepository: Partial<Repository<TechRadarAttachmentEntity>>;

  beforeEach(() => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);
    repository = new AttachmentRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('должен находить вложение по id', async () => {
      const mockAttachment = { id: '1', fileName: 'test.pdf' } as TechRadarAttachmentEntity;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockAttachment);

      const result = await repository.findById('1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockAttachment);
    });

    it('должен возвращать undefined если вложение не найдено', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('findByTechRadarId', () => {
    it('должен находить вложения по techRadarId', async () => {
      const mockAttachments = [
        { id: '1', techRadarId: 'tech-123' },
        { id: '2', techRadarId: 'tech-123' },
      ] as TechRadarAttachmentEntity[];
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue(mockAttachments);

      const result = await repository.findByTechRadarId('tech-123');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { techRadarId: 'tech-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockAttachments);
    });

    it('должен возвращать пустой массив если вложений нет', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByTechRadarId('tech-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('должен создавать вложение', async () => {
      const data = { fileName: 'test.pdf', url: 'http://example.com/test.pdf', techRadarId: 'tech-123' };
      const mockAttachment: any = { id: '1', ...data };

      (mockTypeormRepository.create as jest.Mock).mockReturnValue(mockAttachment);
      (mockTypeormRepository.save as jest.Mock).mockResolvedValue(mockAttachment);

      const result = await repository.create(data);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockAttachment);
      expect(result).toEqual(mockAttachment);
    });
  });

  describe('delete', () => {
    it('должен возвращать true при успешном удалении', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.delete('1');

      expect(result).toBe(true);
    });

    it('должен возвращать false если вложение не найдено', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      const result = await repository.delete('999');

      expect(result).toBe(false);
    });
  });

  describe('deleteByTechRadarId', () => {
    it('должен удалять все вложения технологии', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 3 });

      await repository.deleteByTechRadarId('tech-123');

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith({ techRadarId: 'tech-123' });
    });

    it('должен работать если нет вложений', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await repository.deleteByTechRadarId('tech-123');

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith({ techRadarId: 'tech-123' });
    });
  });
});
