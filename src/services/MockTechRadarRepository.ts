import { TechRadarEntity } from '../models';
import mockData from '../resources/mock-data.json';

export class MockTechRadarRepository {
  private data: TechRadarEntity[];

  constructor() {
    this.data = mockData as TechRadarEntity[];
  }

  async findAll(): Promise<TechRadarEntity[]> {
    return this.data;
  }

  async findById(id: string): Promise<TechRadarEntity | undefined> {
    return this.data.find(item => item.id === id);
  }

  async findByCategory(category: string): Promise<TechRadarEntity[]> {
    return this.data.filter(item => item.category === category);
  }

  async findByType(type: string): Promise<TechRadarEntity[]> {
    return this.data.filter(item => item.type === type);
  }

  async findBySubtype(subtype: string): Promise<TechRadarEntity[]> {
    return this.data.filter(item => item.subtype === subtype);
  }

  async search(query: string): Promise<TechRadarEntity[]> {
    const lowerQuery = query.toLowerCase();
    return this.data.filter(
      item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async findFiltered(filters: {
    category?: string;
    type?: string;
    subtype?: string;
    maturity?: string;
    search?: string;
  }): Promise<TechRadarEntity[]> {
    let result = [...this.data];

    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    if (filters.type) {
      result = result.filter(item => item.type === filters.type);
    }

    if (filters.subtype) {
      result = result.filter(item => item.subtype === filters.subtype);
    }

    if (filters.maturity) {
      result = result.filter(item => item.maturity === filters.maturity);
    }

    if (filters.search) {
      result = await this.search(filters.search);
    }

    return result;
  }

  async save(entity: TechRadarEntity): Promise<TechRadarEntity> {
    const index = this.data.findIndex(item => item.id === entity.id);
    if (index !== -1) {
      this.data[index] = entity;
    } else {
      this.data.push(entity);
    }
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    return false;
  }

  async getStatistics() {
    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const bySubtype: Record<string, number> = {};

    this.data.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      byType[item.type] = (byType[item.type] || 0) + 1;
      if (item.subtype) {
        bySubtype[item.subtype] = (bySubtype[item.subtype] || 0) + 1;
      }
    });

    return {
      total: this.data.length,
      byCategory,
      byType,
      bySubtype,
    };
  }
}
