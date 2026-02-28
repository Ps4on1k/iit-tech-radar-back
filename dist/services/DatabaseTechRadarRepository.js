"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseTechRadarRepository = void 0;
class DatabaseTechRadarRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findAll() {
        return this.repository.find();
    }
    async findById(id) {
        const result = await this.repository.findOne({ where: { id } });
        return result ?? undefined;
    }
    async findByCategory(category) {
        return this.repository.find({ where: { category } });
    }
    async findByType(type) {
        return this.repository.find({ where: { type } });
    }
    async findBySubtype(subtype) {
        return this.repository.find({ where: { subtype } });
    }
    async search(query) {
        return this.repository
            .createQueryBuilder('tech')
            .where('tech.name LIKE :query', { query: `%${query}%` })
            .orWhere('tech.description LIKE :query', { query: `%${query}%` })
            .getMany();
    }
    async findFiltered(filters) {
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
            queryBuilder.andWhere('(tech.name LIKE :search OR tech.description LIKE :search)', { search: `%${filters.search}%` });
        }
        return queryBuilder.getMany();
    }
    async save(entity) {
        return this.repository.save(entity);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
    async getStatistics() {
        const data = await this.findAll();
        const byCategory = {};
        const byType = {};
        const bySubtype = {};
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
exports.DatabaseTechRadarRepository = DatabaseTechRadarRepository;
//# sourceMappingURL=DatabaseTechRadarRepository.js.map