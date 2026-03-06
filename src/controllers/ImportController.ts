import { Request, Response } from 'express';
import { ImportService, ImportResult } from '../services/ImportService';
import { AppDataSource } from '../database';
import { TechRadarEntity } from '../models/TechRadarEntity';
import { notificationService } from '../services/NotificationService';

let importService: ImportService;

// Проверяем, что БД инициализирована
function getImportService(): ImportService {
  if (!importService) {
    importService = new ImportService();
  }
  return importService;
}

export class ImportController {
  /**
   * Импорт технологий из JSON
   * POST /api/import/tech-radar
   * Body: массив объектов TechRadar
   * Query params:
   *  - skipExisting=true - пропускать существующие записи
   *  - updateExisting=true - обновлять существующие записи
   *  - overwrite=true - удалить все и создать заново (перезаписать)
   */
  importTechRadar = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || !['admin', 'manager'].includes(authReq.user.role)) {
        res.status(403).json({ error: 'Только администратор или менеджер может импортировать данные' });
        return;
      }

      const data = req.body;
      const skipExisting = req.query.skipExisting === 'true';
      const updateExisting = req.query.updateExisting === 'true';
      const overwrite = req.query.overwrite === 'true';

      if (!data) {
        res.status(400).json({ error: 'Требуется тело запроса с данными для импорта' });
        return;
      }

      const service = getImportService();
      const result = await service.importTechRadar(data, { skipExisting, updateExisting, overwrite });

      if (!result.success) {
        // Создаем уведомление об ошибке импорта (неблокирующее)
        const errorMessages = result.errors?.map(e => e.message) || ['Неизвестная ошибка'];
        notificationService.notifyImport(
          authReq.user.id,
          false,
          result.imported,
          errorMessages
        );

        res.status(400).json({
          message: 'Импорт завершен с ошибками',
          result,
        });
        return;
      }

      // Создаем уведомление об успешном импорте (неблокирующее)
      notificationService.notifyImport(
        authReq.user.id,
        true,
        result.imported
      );

      res.status(200).json({
        message: 'Импорт успешно завершен',
        result,
      });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка импорта: ${error.message}` });
    }
  };

  /**
   * Экспорт всех технологий в JSON
   * GET /api/import/tech-radar
   */
  exportTechRadar = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || !['admin', 'manager'].includes(authReq.user.role)) {
        res.status(403).json({ error: 'Только администратор или менеджер может экспортировать данные' });
        return;
      }

      const service = getImportService();
      const data = await service.exportTechRadar();

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка экспорта: ${error.message}` });
    }
  };

  /**
   * Предварительная валидация данных перед импортом
   * POST /api/import/tech-radar/validate
   * Query params:
   *  - skipExisting=true - валидировать с требованием ID (для пропуска существующих)
   *  - updateExisting=true - валидировать с требованием ID (для обновления существующих)
   *  - overwrite=true - валидировать без требования ID (для полной перезаписи)
   */
  validateImport = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || !['admin', 'manager'].includes(authReq.user.role)) {
        res.status(403).json({ error: 'Только администратор или менеджер может валидировать данные' });
        return;
      }

      const data = req.body;
      const skipExisting = req.query.skipExisting === 'true';
      const updateExisting = req.query.updateExisting === 'true';
      const overwrite = req.query.overwrite === 'true';

      if (!data) {
        res.status(400).json({ error: 'Требуется тело запроса с данными для валидации' });
        return;
      }

      if (!Array.isArray(data)) {
        res.status(400).json({ error: 'Данные должны быть массивом' });
        return;
      }

      // Создаем временный сервис для валидации
      const service = new ImportService();

      // Режим, требующий ID: если указан skipExisting или updateExisting
      // Для overwrite ID не требуется
      const requireId = (skipExisting || updateExisting) && !overwrite;

      // Валидируем каждую запись и группируем ошибки по индексам записей
      const errorsByIndex = new Map<number, string[]>();

      for (let i = 0; i < data.length; i++) {
        const entity = data[i];

        // Проверка обязательных полей
        const requiredFields: string[] = ['name', 'version', 'type', 'category', 'firstAdded', 'owner', 'maturity', 'riskLevel', 'license', 'supportStatus', 'businessCriticality'];

        if (requireId) {
          requiredFields.unshift('id');
        }

        for (const field of requiredFields) {
          if (entity[field] === undefined || entity[field] === null || entity[field] === '') {
            if (!errorsByIndex.has(i)) {
              errorsByIndex.set(i, []);
            }
            errorsByIndex.get(i)!.push(`Отсутствует обязательное поле: ${field}`);
          }
        }

        // Проверка типа id (если указан)
        if (entity.id !== undefined && entity.id !== null && typeof entity.id !== 'string') {
          if (!errorsByIndex.has(i)) {
            errorsByIndex.set(i, []);
          }
          errorsByIndex.get(i)!.push('Поле id должно быть строкой');
        }
      }

      // Преобразуем в формат, ожидаемый фронтом
      const errors = Array.from(errorsByIndex.entries()).map(([index, errors]) => ({
        index,
        errors,
      }));

      const invalidRecords = errors.length;
      const validRecords = data.length - invalidRecords;

      res.json({
        valid: errors.length === 0,
        totalRecords: data.length,
        validRecords,
        invalidRecords,
        errors,
      });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка валидации: ${error.message}` });
    }
  };
}
