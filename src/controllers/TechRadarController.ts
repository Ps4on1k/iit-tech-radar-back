import { Request, Response } from 'express';
import { config } from '../config';
import { MockTechRadarRepository, DatabaseTechRadarRepository, TechRadarValidationService } from '../services';
import { AppDataSource } from '../database';
import { TechRadarEntity } from '../models';

let techRadarRepo: MockTechRadarRepository | DatabaseTechRadarRepository;
let validationService: TechRadarValidationService;

if (config.dbMode === 'database') {
  const repository = AppDataSource.getRepository(TechRadarEntity);
  techRadarRepo = new DatabaseTechRadarRepository(repository);
  validationService = new TechRadarValidationService();
} else {
  techRadarRepo = new MockTechRadarRepository();
  validationService = new TechRadarValidationService();
}

export class TechRadarController {
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await techRadarRepo.findAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const data = await techRadarRepo.findById(id);

      if (!data) {
        res.status(404).json({ error: 'Технология не найдена' });
        return;
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  };

  getFiltered = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query as Record<string, string | string[] | undefined>;

      const filters: {
        category?: string;
        type?: string;
        subtype?: string;
        maturity?: string;
        search?: string;
      } = {};

      const category = query.category;
      const type = query.type;
      const subtype = query.subtype;
      const maturity = query.maturity;
      const search = query.search;
      const sortBy = query.sortBy;
      const sortOrder = query.sortOrder;

      if (category && typeof category === 'string') filters.category = category;
      if (type && typeof type === 'string') filters.type = type;
      if (subtype && typeof subtype === 'string') filters.subtype = subtype;
      if (maturity && typeof maturity === 'string') filters.maturity = maturity;
      if (search && typeof search === 'string') filters.search = search;

      let data = await techRadarRepo.findFiltered(filters);

      // Сортировка
      if (sortBy && typeof sortBy === 'string') {
        const field = sortBy as keyof TechRadarEntity;
        const order = sortOrder === 'desc' ? -1 : 1;
        data = data.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];

          if (aVal === undefined || bVal === undefined) return 0;
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return order * aVal.localeCompare(bVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return order * (aVal - bVal);
          }
          return 0;
        });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при фильтрации данных' });
    }
  };

  getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await techRadarRepo.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении статистики' });
    }
  };

  getByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = String(req.params.category);
      const data = await techRadarRepo.findByCategory(category);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  };

  getByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const type = String(req.params.type);
      const data = await techRadarRepo.findByType(type);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const q = req.query.q;

      if (!q || (typeof q !== 'string')) {
        res.status(400).json({ error: 'Требуется параметр поиска q' });
        return;
      }

      const data = await techRadarRepo.search(q);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при поиске' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || !['admin', 'manager'].includes(authReq.user.role)) {
        res.status(403).json({ error: 'Только администратор или менеджер может создавать технологии' });
        return;
      }

      const entity: Partial<TechRadarEntity> = req.body;

      // Валидация схемы
      const validationResult = validationService.validate(entity, false);
      if (!validationResult.valid) {
        res.status(400).json({
          error: 'Ошибка валидации данных',
          details: validationResult.errors,
        });
        return;
      }

      const saved = await techRadarRepo.save(entity as TechRadarEntity);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при создании записи: ${error.message}` });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || !['admin', 'manager'].includes(authReq.user.role)) {
        res.status(403).json({ error: 'Только администратор или менеджер может редактировать технологии' });
        return;
      }

      const id = String(req.params.id);
      const updateData: Partial<TechRadarEntity> = req.body;

      // Проверка существования записи
      const existing = await techRadarRepo.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Технология не найдена' });
        return;
      }

      // Валидация схемы (isUpdate=true для частичной валидации)
      const validationResult = validationService.validate(updateData, true);
      if (!validationResult.valid) {
        res.status(400).json({
          error: 'Ошибка валидации данных',
          details: validationResult.errors,
        });
        return;
      }

      // Проверка что ID в теле совпадает с ID в пути (если указан)
      if (updateData.id && updateData.id !== id) {
        res.status(400).json({ error: 'ID в теле запроса должен совпадать с ID в пути' });
        return;
      }

      const entity: TechRadarEntity = { ...existing, ...updateData, id } as TechRadarEntity;
      const updated = await techRadarRepo.save(entity);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при обновлении записи: ${error.message}` });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || !['admin', 'manager'].includes(authReq.user.role)) {
        res.status(403).json({ error: 'Только администратор или менеджер может удалять технологии' });
        return;
      }

      const id = String(req.params.id);
      const deleted = await techRadarRepo.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Технология не найдена' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при удалении записи' });
    }
  };
}
