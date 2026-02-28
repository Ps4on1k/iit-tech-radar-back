import { Repository } from 'typeorm';
import { TechRadarEntity } from '../models';
export declare class DatabaseTechRadarRepository {
    private repository;
    constructor(repository: Repository<TechRadarEntity>);
    findAll(): Promise<TechRadarEntity[]>;
    findById(id: string): Promise<TechRadarEntity | undefined>;
    findByCategory(category: string): Promise<TechRadarEntity[]>;
    findByType(type: string): Promise<TechRadarEntity[]>;
    findBySubtype(subtype: string): Promise<TechRadarEntity[]>;
    search(query: string): Promise<TechRadarEntity[]>;
    findFiltered(filters: {
        category?: string;
        type?: string;
        subtype?: string;
        maturity?: string;
        search?: string;
    }): Promise<TechRadarEntity[]>;
    save(entity: TechRadarEntity): Promise<TechRadarEntity>;
    delete(id: string): Promise<boolean>;
    getStatistics(): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byType: Record<string, number>;
        bySubtype: Record<string, number>;
    }>;
}
//# sourceMappingURL=DatabaseTechRadarRepository.d.ts.map