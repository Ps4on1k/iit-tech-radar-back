import { Request, Response } from 'express';
import { config } from '../config';
import { MockTechRadarRepository, DatabaseTechRadarRepository, TechRadarValidationService, ITechRadarRepository, auditService, relatedTechRadarService, notificationService } from '../services';
import { AppDataSource } from '../database';
import { TechRadarEntity } from '../models';

let techRadarRepo: ITechRadarRepository;
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
      
      // Pagination parameters
      const page = query.page ? parseInt(query.page as string, 10) : 1;
      const limit = query.limit ? parseInt(query.limit as string, 10) : 100;
      const offset = (page - 1) * limit;

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

      // Apply pagination
      const totalItems = data.length;
      const paginatedData = data.slice(offset, offset + limit);
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
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
        await auditService.logFailure({
          userId: authReq.user?.id,
          action: 'CREATE',
          entity: 'TechRadar',
          ipAddress: req.ip,
          details: { error: 'Validation failed', validationErrors: validationResult.errors },
        });
        res.status(400).json({
          error: 'Ошибка валидации данных',
          details: validationResult.errors,
        });
        return;
      }

      const saved = await techRadarRepo.save(entity as TechRadarEntity);

      await auditService.logSuccess({
        userId: authReq.user.id,
        action: 'CREATE',
        entity: 'TechRadar',
        entityId: saved.id,
        ipAddress: req.ip,
        details: { name: saved.name, version: saved.version },
      });

      // Логируем в историю изменений
      await relatedTechRadarService.logChange({
        techRadarId: saved.id,
        userId: authReq.user.id,
        action: 'CREATE',
        newValues: { name: saved.name, version: saved.version, type: saved.type, category: saved.category },
        comment: 'Создание технологии',
      });

      // Создаем уведомление (неблокирующее)
      notificationService.notifyTechRadarChange(
        authReq.user.id,
        'CREATE',
        `${saved.name} ${saved.version}`,
        saved.id
      );

      res.status(201).json(saved);
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'CREATE',
        entity: 'TechRadar',
        ipAddress: req.ip,
        details: { error: error.message },
      });
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
        await auditService.logFailure({
          userId: authReq.user.id,
          action: 'UPDATE',
          entity: 'TechRadar',
          entityId: id,
          ipAddress: req.ip,
          details: { error: 'Not found' },
        });
        res.status(404).json({ error: 'Технология не найдена' });
        return;
      }

      // Валидация схемы (isUpdate=true для частичной валидации)
      const validationResult = validationService.validate(updateData, true);
      if (!validationResult.valid) {
        await auditService.logFailure({
          userId: authReq.user.id,
          action: 'UPDATE',
          entity: 'TechRadar',
          entityId: id,
          ipAddress: req.ip,
          details: { error: 'Validation failed', validationErrors: validationResult.errors },
        });
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

      await auditService.logSuccess({
        userId: authReq.user.id,
        action: 'UPDATE',
        entity: 'TechRadar',
        entityId: updated.id,
        ipAddress: req.ip,
        details: { name: updated.name, version: updated.version, changes: Object.keys(updateData) },
      });

      // Логируем в историю изменений
      await relatedTechRadarService.logChange({
        techRadarId: updated.id,
        userId: authReq.user.id,
        action: 'UPDATE',
        previousValues: { ...existing },
        newValues: { ...updated },
        comment: `Обновление полей: ${Object.keys(updateData).join(', ')}`,
      });

      // Создаем уведомление об обновлении (неблокирующее)
      notificationService.notifyTechRadarChange(
        authReq.user.id,
        'UPDATE',
        `${updated.name} ${updated.version}`,
        updated.id
      );

      res.json(updated);
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'UPDATE',
        entity: 'TechRadar',
        ipAddress: req.ip,
        details: { error: error.message },
      });
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

      // Получаем запись для логирования
      const existing = await techRadarRepo.findById(id);

      if (!existing) {
        await auditService.logFailure({
          userId: authReq.user.id,
          action: 'DELETE',
          entity: 'TechRadar',
          entityId: id,
          ipAddress: req.ip,
          details: { error: 'Not found' },
        });
        res.status(404).json({ error: 'Технология не найдена' });
        return;
      }

      // Логируем в историю изменений ПЕРЕД удалением (чтобы не нарушить FK)
      await relatedTechRadarService.logChange({
        techRadarId: id,
        userId: authReq.user.id,
        action: 'DELETE',
        previousValues: { ...existing },
        comment: `Удаление технологии: ${existing.name}`,
      });

      const deleted = await techRadarRepo.delete(id);

      if (!deleted) {
        await auditService.logFailure({
          userId: authReq.user.id,
          action: 'DELETE',
          entity: 'TechRadar',
          entityId: id,
          ipAddress: req.ip,
          details: { error: 'Not found' },
        });
        res.status(404).json({ error: 'Технология не найдена' });
        return;
      }

      await auditService.logSuccess({
        userId: authReq.user.id,
        action: 'DELETE',
        entity: 'TechRadar',
        entityId: id,
        ipAddress: req.ip,
        details: { name: existing.name, version: existing.version },
      });

      // Создаем уведомление об удалении (неблокирующее)
      notificationService.notifyTechRadarChange(
        authReq.user.id,
        'DELETE',
        `${existing.name} ${existing.version}`,
        id
      );

      res.status(204).send();
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadar',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(500).json({ error: `Ошибка при удалении записи: ${error.message}` });
    }
  };
}
