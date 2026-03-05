import { ReviewRepository } from '../../repositories/ReviewRepository';
import { TechRadarReviewEntity } from '../../models/TechRadarReviewEntity';
import { AppDataSource } from '../../database';
import { Repository, SelectQueryBuilder } from 'typeorm';

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('ReviewRepository', () => {
  let repository: ReviewRepository;
  let mockTypeormRepository: Partial<Repository<TechRadarReviewEntity>>;

  beforeEach(() => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);
    repository = new ReviewRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('должен находить отзыв по id', async () => {
      const mockReview = { id: '1', rating: 5 } as TechRadarReviewEntity;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockReview);

      const result = await repository.findById('1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockReview);
    });

    it('должен возвращать undefined если отзыв не найден', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('findByTechRadarId', () => {
    it('должен находить отзывы технологии', async () => {
      const mockReviews = [
        { id: '1', rating: 5, techRadarId: 'tech-123' },
        { id: '2', rating: 4, techRadarId: 'tech-123' },
      ] as TechRadarReviewEntity[];
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue(mockReviews);

      const result = await repository.findByTechRadarId('tech-123');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { techRadarId: 'tech-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockReviews);
    });

    it('должен возвращать пустой массив если отзывов нет', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByTechRadarId('tech-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('должен создавать отзыв', async () => {
      const data = { rating: 5, comment: 'Great!', techRadarId: 'tech-123' };
      const mockReview = { id: '1', ...data } as TechRadarReviewEntity;

      (mockTypeormRepository.create as jest.Mock).mockReturnValue(mockReview);
      (mockTypeormRepository.save as jest.Mock).mockResolvedValue(mockReview);

      const result = await repository.create(data);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockReview);
      expect(result).toEqual(mockReview);
    });
  });

  describe('update', () => {
    it('должен обновлять отзыв', async () => {
      const data = { rating: 4, comment: 'Updated' };
      const mockReview = { id: '1', ...data } as TechRadarReviewEntity;

      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockReview);

      const result = await repository.update('1', data);

      expect(mockTypeormRepository.update).toHaveBeenCalledWith('1', data);
      expect(result).toEqual(mockReview);
    });

    it('должен возвращать undefined если отзыв не найден после обновления', async () => {
      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.update('1', { rating: 4 });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('должен возвращать true при успешном удалении', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.delete('1');

      expect(result).toBe(true);
    });

    it('должен возвращать false если отзыв не найден', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      const result = await repository.delete('999');

      expect(result).toBe(false);
    });
  });

  describe('getAverageRating', () => {
    it('должен возвращать средний рейтинг', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ average: '4.5' }),
      };
      (mockTypeormRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await repository.getAverageRating('tech-123');

      expect(result).toBe(4.5);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('AVG(review.rating)', 'average');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('review.techRadarId = :techRadarId', {
        techRadarId: 'tech-123',
      });
    });

    it('должен возвращать null если нет отзывов', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ average: null }),
      };
      (mockTypeormRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await repository.getAverageRating('tech-123');

      expect(result).toBeNull();
    });

    it('должен возвращать null если average undefined', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({}),
      };
      (mockTypeormRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await repository.getAverageRating('tech-123');

      expect(result).toBeNull();
    });
  });
});
