import { Repository } from 'typeorm';
import { AppDataSource } from '../database';
import { TechRadarTagEntity } from '../models/TechRadarTagEntity';

export interface ITagRepository {
  findById(id: string): Promise<TechRadarTagEntity | undefined>;
  findByTechRadarId(techRadarId: string): Promise<TechRadarTagEntity[]>;
  create(data: Partial<TechRadarTagEntity>): Promise<TechRadarTagEntity>;
  delete(id: string): Promise<boolean>;
  deleteByTechRadarId(techRadarId: string): Promise<void>;
  addTags(techRadarId: string, tags: string[]): Promise<TechRadarTagEntity[]>;
}

export class TagRepository implements ITagRepository {
  private repository: Repository<TechRadarTagEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TechRadarTagEntity);
  }

  async findById(id: string): Promise<TechRadarTagEntity | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByTechRadarId(techRadarId: string): Promise<TechRadarTagEntity[]> {
    return this.repository.find({
      where: { techRadarId },
      order: { name: 'ASC' },
    });
  }

  async create(data: Partial<TechRadarTagEntity>): Promise<TechRadarTagEntity> {
    const tag = this.repository.create(data);
    return this.repository.save(tag);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  async deleteByTechRadarId(techRadarId: string): Promise<void> {
    await this.repository.delete({ techRadarId });
  }

  async addTags(techRadarId: string, tags: string[]): Promise<TechRadarTagEntity[]> {
    // Удаляем старые теги
    await this.deleteByTechRadarId(techRadarId);

    // Добавляем новые
    const newTags: TechRadarTagEntity[] = [];
    for (const tagName of tags) {
      if (tagName.trim()) {
        const tag = await this.create({ techRadarId, name: tagName.trim() });
        newTags.push(tag);
      }
    }
    return newTags;
  }
}
