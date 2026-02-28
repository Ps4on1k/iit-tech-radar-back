import { TechRadarEntity } from '../models/TechRadarEntity';
export interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: ImportError[];
}
export interface ImportError {
    index: number;
    id?: string;
    message: string;
}
export declare class ImportService {
    private repository;
    constructor();
    /**
     * Валидация одной сущности TechRadar
     */
    private validateEntity;
    /**
     * Импорт технологий из JSON массива
     * Использует параметризованные запросы TypeORM для защиты от SQL инъекций
     */
    importTechRadar(data: any[], options?: {
        skipExisting?: boolean;
        updateExisting?: boolean;
    }): Promise<ImportResult>;
    /**
     * Экспорт всех технологий в JSON
     */
    exportTechRadar(): Promise<TechRadarEntity[]>;
}
//# sourceMappingURL=ImportService.d.ts.map