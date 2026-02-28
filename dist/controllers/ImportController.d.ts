import { Request, Response } from 'express';
export declare class ImportController {
    /**
     * Импорт технологий из JSON
     * POST /api/import/tech-radar
     * Body: массив объектов TechRadar
     * Query params:
     *  - skipExisting=true - пропускать существующие записи
     *  - updateExisting=true - обновлять существующие записи
     */
    importTechRadar: (req: Request, res: Response) => Promise<void>;
    /**
     * Экспорт всех технологий в JSON
     * GET /api/import/tech-radar
     */
    exportTechRadar: (req: Request, res: Response) => Promise<void>;
    /**
     * Предварительная валидация данных перед импортом
     * POST /api/import/tech-radar/validate
     */
    validateImport: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ImportController.d.ts.map