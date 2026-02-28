import { Repository, DeleteResult } from 'typeorm';
import { TechRadarEntity } from '../models';

export class DatabaseTechRadarRepository {
  private repository: Repository<TechRadarEntity>;

  constructor(repository: Repository<TechRadarEntity>) {
    this.repository = repository;
  }

  async findAll(): Promise<TechRadarEntity[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<TechRadarEntity | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByCategory(category: string): Promise<TechRadarEntity[]> {
    return this.repository.find({ where: { category } });
  }

  async findByType(type: string): Promise<TechRadarEntity[]> {
    return this.repository.find({ where: { type } });
  }

  async findBySubtype(subtype: string): Promise<TechRadarEntity[]> {
    return this.repository.find({ where: { subtype } });
  }

  async search(query: string): Promise<TechRadarEntity[]> {
    return this.repository
      .createQueryBuilder('tech')
      .where('tech.name LIKE :query', { query: `%${query}%` })
      .orWhere('tech.description LIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async findFiltered(filters: {
    category?: string;
    type?: string;
    subtype?: string;
    maturity?: string;
    search?: string;
  }): Promise<TechRadarEntity[]> {
    const queryBuilder = this.repository.createQueryBuilder('tech');

    if (filters.category) {
      queryBuilder.andWhere('tech.category = :category', { category: filters.category });
    }

    if (filters.type) {
      queryBuilder.andWhere('tech.type = :type', { type: filters.type });
    }

    if (filters.subtype) {
      queryBuilder.andWhere('tech.subtype = :subtype', { subtype: filters.subtype });
    }

    if (filters.maturity) {
      queryBuilder.andWhere('tech.maturity = :maturity', { maturity: filters.maturity });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(tech.name LIKE :search OR tech.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async save(entity: TechRadarEntity): Promise<TechRadarEntity> {
    return this.repository.save(entity);
  }

  async delete(id: string): Promise<boolean> {
    const result: DeleteResult = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getStatistics() {
    const data = await this.findAll();

    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const bySubtype: Record<string, number> = {};

    data.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      byType[item.type] = (byType[item.type] || 0) + 1;
      if (item.subtype) {
        bySubtype[item.subtype] = (bySubtype[item.subtype] || 0) + 1;
      }
    });

    return {
      total: data.length,
      byCategory,
      byType,
      bySubtype,
    };
  }
}
