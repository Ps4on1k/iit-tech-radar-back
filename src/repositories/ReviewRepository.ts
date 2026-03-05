import { Repository } from 'typeorm';
import { AppDataSource } from '../database';
import { TechRadarReviewEntity } from '../models/TechRadarReviewEntity';

export interface IReviewRepository {
  findById(id: string): Promise<TechRadarReviewEntity | undefined>;
  findByTechRadarId(techRadarId: string): Promise<TechRadarReviewEntity[]>;
  create(data: Partial<TechRadarReviewEntity>): Promise<TechRadarReviewEntity>;
  update(id: string, data: Partial<TechRadarReviewEntity>): Promise<TechRadarReviewEntity | undefined>;
  delete(id: string): Promise<boolean>;
  getAverageRating(techRadarId: string): Promise<number | null>;
}

export class ReviewRepository implements IReviewRepository {
  private repository: Repository<TechRadarReviewEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TechRadarReviewEntity);
  }

  async findById(id: string): Promise<TechRadarReviewEntity | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByTechRadarId(techRadarId: string): Promise<TechRadarReviewEntity[]> {
    return this.repository.find({
      where: { techRadarId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<TechRadarReviewEntity>): Promise<TechRadarReviewEntity> {
    const review = this.repository.create(data);
    return this.repository.save(review);
  }

  async update(id: string, data: Partial<TechRadarReviewEntity>): Promise<TechRadarReviewEntity | undefined> {
    await this.repository.update(id, data);
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  async getAverageRating(techRadarId: string): Promise<number | null> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.techRadarId = :techRadarId', { techRadarId })
      .getRawOne();
    
    return result.average ? parseFloat(result.average) : null;
  }
}
