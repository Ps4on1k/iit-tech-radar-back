import { Repository } from 'typeorm';
import { AppDataSource } from '../database';
import { TechRadarHistoryEntity } from '../models/TechRadarHistoryEntity';

export interface IHistoryRepository {
  findById(id: string): Promise<TechRadarHistoryEntity | undefined>;
  findByTechRadarId(techRadarId: string, limit?: number): Promise<TechRadarHistoryEntity[]>;
  create(data: Partial<TechRadarHistoryEntity>): Promise<TechRadarHistoryEntity>;
}

export class HistoryRepository implements IHistoryRepository {
  private repository: Repository<TechRadarHistoryEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TechRadarHistoryEntity);
  }

  async findById(id: string): Promise<TechRadarHistoryEntity | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByTechRadarId(techRadarId: string, limit: number = 50): Promise<TechRadarHistoryEntity[]> {
    return this.repository.find({
      where: { techRadarId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async create(data: Partial<TechRadarHistoryEntity>): Promise<TechRadarHistoryEntity> {
    const history = this.repository.create(data);
    return this.repository.save(history);
  }
}
