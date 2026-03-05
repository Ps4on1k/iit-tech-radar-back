import { ReviewRepository, IReviewRepository } from '../repositories/ReviewRepository';
import { TagRepository, ITagRepository } from '../repositories/TagRepository';
import { AttachmentRepository, IAttachmentRepository } from '../repositories/AttachmentRepository';
import { HistoryRepository, IHistoryRepository } from '../repositories/HistoryRepository';

export interface ReviewDto {
  techRadarId: string;
  userId?: string;
  rating: number;
  comment?: string;
  authorName?: string;
}

export interface TagDto {
  techRadarId: string;
  name: string;
}

export interface AttachmentDto {
  techRadarId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  description?: string;
  uploadedBy?: string;
}

export interface HistoryDto {
  techRadarId: string;
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  comment?: string;
}

/**
 * Сервис для управления связанными данными TechRadar
 */
export class RelatedTechRadarService {
  private reviewRepository: IReviewRepository;
  private tagRepository: ITagRepository;
  private attachmentRepository: IAttachmentRepository;
  private historyRepository: IHistoryRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.tagRepository = new TagRepository();
    this.attachmentRepository = new AttachmentRepository();
    this.historyRepository = new HistoryRepository();
  }

  // === Отзывы ===

  async getReviews(techRadarId: string) {
    return this.reviewRepository.findByTechRadarId(techRadarId);
  }

  async getAverageRating(techRadarId: string): Promise<number | null> {
    return this.reviewRepository.getAverageRating(techRadarId);
  }

  async createReview(dto: ReviewDto) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new Error('Рейтинг должен быть от 1 до 5');
    }
    return this.reviewRepository.create(dto);
  }

  async updateReview(id: string, dto: Partial<ReviewDto>) {
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new Error('Рейтинг должен быть от 1 до 5');
    }
    return this.reviewRepository.update(id, dto);
  }

  async deleteReview(id: string) {
    return this.reviewRepository.delete(id);
  }

  // === Теги ===

  async getTags(techRadarId: string) {
    return this.tagRepository.findByTechRadarId(techRadarId);
  }

  async addTags(techRadarId: string, tags: string[]) {
    return this.tagRepository.addTags(techRadarId, tags);
  }

  async deleteTag(id: string) {
    return this.tagRepository.delete(id);
  }

  // === Вложения ===

  async getAttachments(techRadarId: string) {
    return this.attachmentRepository.findByTechRadarId(techRadarId);
  }

  async createAttachment(dto: AttachmentDto) {
    return this.attachmentRepository.create(dto);
  }

  async deleteAttachment(id: string) {
    return this.attachmentRepository.delete(id);
  }

  // === История ===

  async getHistory(techRadarId: string, limit: number = 50) {
    return this.historyRepository.findByTechRadarId(techRadarId, limit);
  }

  async logChange(dto: HistoryDto) {
    return this.historyRepository.create(dto);
  }
}

export const relatedTechRadarService = new RelatedTechRadarService();
