"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTechRadarRepository = void 0;
const mock_data_json_1 = __importDefault(require("../resources/mock-data.json"));
class MockTechRadarRepository {
    constructor() {
        this.data = mock_data_json_1.default;
    }
    async findAll() {
        return this.data;
    }
    async findById(id) {
        return this.data.find(item => item.id === id);
    }
    async findByCategory(category) {
        return this.data.filter(item => item.category === category);
    }
    async findByType(type) {
        return this.data.filter(item => item.type === type);
    }
    async findBySubtype(subtype) {
        return this.data.filter(item => item.subtype === subtype);
    }
    async search(query) {
        const lowerQuery = query.toLowerCase();
        return this.data.filter(item => item.name.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery));
    }
    async findFiltered(filters) {
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
    async save(entity) {
        const index = this.data.findIndex(item => item.id === entity.id);
        if (index !== -1) {
            this.data[index] = entity;
        }
        else {
            this.data.push(entity);
        }
        return entity;
    }
    async delete(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            return true;
        }
        return false;
    }
    async getStatistics() {
        const byCategory = {};
        const byType = {};
        const bySubtype = {};
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
exports.MockTechRadarRepository = MockTechRadarRepository;
//# sourceMappingURL=MockTechRadarRepository.js.map