import { TechRadarEntity } from '../models/TechRadarEntity';
export interface ValidationError {
    field?: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export declare class TechRadarValidationService {
    private repository;
    constructor();
    /**
     * Валидация сущности TechRadar при создании/обновлении
     */
    validate(entity: Partial<TechRadarEntity>, isUpdate?: boolean): ValidationResult;
    /**
     * Проверка существования сущности по ID
     */
    existsById(id: string): Promise<boolean>;
}
//# sourceMappingURL=TechRadarValidationService.d.ts.map