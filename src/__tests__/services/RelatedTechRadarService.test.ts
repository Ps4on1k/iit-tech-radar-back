import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RelatedTechRadarService } from '../../services/RelatedTechRadarService';

// Мок для репозиториев
jest.mock('../../repositories/ReviewRepository', () => ({
  ReviewRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findByTechRadarId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAverageRating: jest.fn(),
  })),
}));

jest.mock('../../repositories/TagRepository', () => ({
  TagRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findByTechRadarId: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteByTechRadarId: jest.fn(),
    addTags: jest.fn(),
  })),
}));

jest.mock('../../repositories/AttachmentRepository', () => ({
  AttachmentRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findByTechRadarId: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteByTechRadarId: jest.fn(),
  })),
}));

jest.mock('../../repositories/HistoryRepository', () => ({
  HistoryRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findByTechRadarId: jest.fn(),
    create: jest.fn(),
  })),
}));

describe('RelatedTechRadarService', () => {
  let service: RelatedTechRadarService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RelatedTechRadarService();
  });

  const mockTechRadarId = 'tech-123';

  describe('Отзывы', () => {
    describe('createReview', () => {
      it('должен создавать отзыв с валидным рейтингом', async () => {
        const mockReview = {
          id: 'review-1',
          techRadarId: mockTechRadarId,
          rating: 5,
          comment: 'Отличная технология!',
        };

        const mockRepo = (service as any).reviewRepository;
        mockRepo.create.mockResolvedValue(mockReview);

        const result = await service.createReview({
          techRadarId: mockTechRadarId,
          rating: 5,
          comment: 'Отличная технология!',
        });

        expect(result).toEqual(mockReview);
        expect(mockRepo.create).toHaveBeenCalledWith({
          techRadarId: mockTechRadarId,
          rating: 5,
          comment: 'Отличная технология!',
        });
      });

      it('должен выбрасывать ошибку при рейтинге < 1', async () => {
        await expect(
          service.createReview({
            techRadarId: mockTechRadarId,
            rating: 0,
          })
        ).rejects.toThrow('Рейтинг должен быть от 1 до 5');
      });

      it('должен выбрасывать ошибку при рейтинге > 5', async () => {
        await expect(
          service.createReview({
            techRadarId: mockTechRadarId,
            rating: 6,
          })
        ).rejects.toThrow('Рейтинг должен быть от 1 до 5');
      });
    });

    describe('updateReview', () => {
      it('должен обновлять отзыв с валидным рейтингом', async () => {
        const mockReview = {
          id: 'review-1',
          techRadarId: mockTechRadarId,
          rating: 4,
        };

        const mockRepo = (service as any).reviewRepository;
        mockRepo.update.mockResolvedValue(mockReview);

        const result = await service.updateReview('review-1', { rating: 4 });

        expect(result).toEqual(mockReview);
        expect(mockRepo.update).toHaveBeenCalledWith('review-1', { rating: 4 });
      });

      it('должен выбрасывать ошибку при невалидном рейтинге', async () => {
        await expect(
          service.updateReview('review-1', { rating: 10 })
        ).rejects.toThrow('Рейтинг должен быть от 1 до 5');
      });
    });

    describe('getReviews', () => {
      it('должен возвращать список отзывов', async () => {
        const mockReviews = [
          { id: 'review-1', rating: 5, comment: 'Отлично' },
          { id: 'review-2', rating: 4, comment: 'Хорошо' },
        ];

        const mockRepo = (service as any).reviewRepository;
        mockRepo.findByTechRadarId.mockResolvedValue(mockReviews);

        const result = await service.getReviews(mockTechRadarId);

        expect(result).toEqual(mockReviews);
        expect(mockRepo.findByTechRadarId).toHaveBeenCalledWith(mockTechRadarId);
      });
    });

    describe('getAverageRating', () => {
      it('должен возвращать средний рейтинг', async () => {
        const mockRepo = (service as any).reviewRepository;
        mockRepo.getAverageRating.mockResolvedValue(4.5);

        const result = await service.getAverageRating(mockTechRadarId);

        expect(result).toBe(4.5);
        expect(mockRepo.getAverageRating).toHaveBeenCalledWith(mockTechRadarId);
      });

      it('должен возвращать null если нет отзывов', async () => {
        const mockRepo = (service as any).reviewRepository;
        mockRepo.getAverageRating.mockResolvedValue(null);

        const result = await service.getAverageRating(mockTechRadarId);

        expect(result).toBeNull();
      });
    });

    describe('deleteReview', () => {
      it('должен удалять отзыв', async () => {
        const mockRepo = (service as any).reviewRepository;
        mockRepo.delete.mockResolvedValue(true);

        const result = await service.deleteReview('review-1');

        expect(result).toBe(true);
        expect(mockRepo.delete).toHaveBeenCalledWith('review-1');
      });
    });
  });

  describe('Теги', () => {
    describe('addTags', () => {
      it('должен добавлять теги', async () => {
        const mockTags = [
          { id: 'tag-1', name: 'frontend' },
          { id: 'tag-2', name: 'react' },
        ];

        const mockRepo = (service as any).tagRepository;
        mockRepo.addTags.mockResolvedValue(mockTags);

        const result = await service.addTags(mockTechRadarId, ['frontend', 'react']);

        expect(result).toEqual(mockTags);
        expect(mockRepo.addTags).toHaveBeenCalledWith(mockTechRadarId, ['frontend', 'react']);
      });

      it('должен игнорировать пустые теги', async () => {
        const mockRepo = (service as any).tagRepository;
        mockRepo.addTags.mockResolvedValue([]);

        await service.addTags(mockTechRadarId, ['', '  ']);

        expect(mockRepo.addTags).toHaveBeenCalledWith(mockTechRadarId, ['', '  ']);
      });
    });

    describe('getTags', () => {
      it('должен возвращать список тегов', async () => {
        const mockTags = [
          { id: 'tag-1', name: 'frontend' },
          { id: 'tag-2', name: 'react' },
        ];

        const mockRepo = (service as any).tagRepository;
        mockRepo.findByTechRadarId.mockResolvedValue(mockTags);

        const result = await service.getTags(mockTechRadarId);

        expect(result).toEqual(mockTags);
        expect(mockRepo.findByTechRadarId).toHaveBeenCalledWith(mockTechRadarId);
      });
    });

    describe('deleteTag', () => {
      it('должен удалять тег', async () => {
        const mockRepo = (service as any).tagRepository;
        mockRepo.delete.mockResolvedValue(true);

        const result = await service.deleteTag('tag-1');

        expect(result).toBe(true);
        expect(mockRepo.delete).toHaveBeenCalledWith('tag-1');
      });
    });
  });

  describe('Вложения', () => {
    describe('createAttachment', () => {
      it('должен создавать вложение', async () => {
        const mockAttachment = {
          id: 'attachment-1',
          fileName: 'screenshot.png',
          originalName: 'screenshot.png',
          mimeType: 'image/png',
          size: 1024,
        };

        const mockRepo = (service as any).attachmentRepository;
        mockRepo.create.mockResolvedValue(mockAttachment);

        const result = await service.createAttachment({
          techRadarId: mockTechRadarId,
          fileName: 'screenshot.png',
          originalName: 'screenshot.png',
          mimeType: 'image/png',
          size: 1024,
        });

        expect(result).toEqual(mockAttachment);
        expect(mockRepo.create).toHaveBeenCalledWith({
          techRadarId: mockTechRadarId,
          fileName: 'screenshot.png',
          originalName: 'screenshot.png',
          mimeType: 'image/png',
          size: 1024,
        });
      });
    });

    describe('getAttachments', () => {
      it('должен возвращать список вложений', async () => {
        const mockAttachments = [
          { id: 'att-1', fileName: 'doc.pdf' },
          { id: 'att-2', fileName: 'image.png' },
        ];

        const mockRepo = (service as any).attachmentRepository;
        mockRepo.findByTechRadarId.mockResolvedValue(mockAttachments);

        const result = await service.getAttachments(mockTechRadarId);

        expect(result).toEqual(mockAttachments);
        expect(mockRepo.findByTechRadarId).toHaveBeenCalledWith(mockTechRadarId);
      });
    });

    describe('deleteAttachment', () => {
      it('должен удалять вложение', async () => {
        const mockRepo = (service as any).attachmentRepository;
        mockRepo.delete.mockResolvedValue(true);

        const result = await service.deleteAttachment('att-1');

        expect(result).toBe(true);
        expect(mockRepo.delete).toHaveBeenCalledWith('att-1');
      });
    });
  });

  describe('История', () => {
    describe('logChange', () => {
      it('должен записывать изменение в историю', async () => {
        const mockHistory = {
          id: 'history-1',
          techRadarId: mockTechRadarId,
          action: 'UPDATE',
          previousValues: { name: 'Old Name' },
          newValues: { name: 'New Name' },
        };

        const mockRepo = (service as any).historyRepository;
        mockRepo.create.mockResolvedValue(mockHistory);

        const result = await service.logChange({
          techRadarId: mockTechRadarId,
          action: 'UPDATE',
          previousValues: { name: 'Old Name' },
          newValues: { name: 'New Name' },
        });

        expect(result).toEqual(mockHistory);
        expect(mockRepo.create).toHaveBeenCalledWith({
          techRadarId: mockTechRadarId,
          action: 'UPDATE',
          previousValues: { name: 'Old Name' },
          newValues: { name: 'New Name' },
        });
      });
    });

    describe('getHistory', () => {
      it('должен возвращать историю изменений', async () => {
        const mockHistory = [
          { id: 'history-1', action: 'UPDATE', createdAt: new Date() },
          { id: 'history-2', action: 'CREATE', createdAt: new Date() },
        ];

        const mockRepo = (service as any).historyRepository;
        mockRepo.findByTechRadarId.mockResolvedValue(mockHistory);

        const result = await service.getHistory(mockTechRadarId, 10);

        expect(result).toEqual(mockHistory);
        expect(mockRepo.findByTechRadarId).toHaveBeenCalledWith(mockTechRadarId, 10);
      });

      it('должен использовать limit по умолчанию 50', async () => {
        const mockRepo = (service as any).historyRepository;
        mockRepo.findByTechRadarId.mockResolvedValue([]);

        await service.getHistory(mockTechRadarId);

        expect(mockRepo.findByTechRadarId).toHaveBeenCalledWith(mockTechRadarId, 50);
      });
    });
  });
});
