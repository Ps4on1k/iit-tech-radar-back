import { Request, Response } from 'express';
export declare class TechRadarController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getFiltered: (req: Request, res: Response) => Promise<void>;
    getStatistics: (req: Request, res: Response) => Promise<void>;
    getByCategory: (req: Request, res: Response) => Promise<void>;
    getByType: (req: Request, res: Response) => Promise<void>;
    search: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=TechRadarController.d.ts.map