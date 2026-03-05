import { AppDataSource } from '../database';
import { TechRadarEntity } from '../models/TechRadarEntity';
import { Repository } from 'typeorm';
import {
  TECH_RADAR_TYPES,
  TECH_RADAR_SUBTYPES,
  TECH_RADAR_CATEGORIES,
  TECH_RADAR_MATURITY,
  TECH_RADAR_RISK_LEVEL,
  TECH_RADAR_SUPPORT_STATUS,
  TECH_RADAR_PERFORMANCE_IMPACT,
  TECH_RADAR_CONTRIBUTION_FREQUENCY,
  TECH_RADAR_COST_FACTOR,
  TECH_RADAR_BUSINESS_CRITICALITY,
  TECH_RADAR_CPU,
  TECH_RADAR_MEMORY,
  TECH_RADAR_STORAGE,
} from '../constants/tech-radar.constants';

// Тип для результата импорта
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

export class ImportService {
  private repository: Repository<TechRadarEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TechRadarEntity);
  }

  /**
   * Валидация одной сущности TechRadar
   */
  private validateEntity(entity: any, index: number): ImportError | null {
    // Проверка обязательных полей
    const requiredFields = ['id', 'name', 'version', 'type', 'category', 'firstAdded', 'owner', 'maturity', 'riskLevel', 'license', 'supportStatus', 'businessCriticality'];
    for (const field of requiredFields) {
      if (entity[field] === undefined || entity[field] === null || entity[field] === '') {
        return {
          index,
          id: entity.id,
          message: `Отсутствует обязательное поле: ${field}`,
        };
      }
    }

    // Проверка типов данных
    if (typeof entity.id !== 'string') {
      return { index, id: entity.id, message: 'Поле id должно быть строкой' };
    }
    if (typeof entity.name !== 'string') {
      return { index, id: entity.id, message: 'Поле name должно быть строкой' };
    }
    if (typeof entity.version !== 'string') {
      return { index, id: entity.id, message: 'Поле version должно быть строкой' };
    }

    // Валидация enum полей с защитой от SQL инъекций (строго заданные значения)
    if (entity.type && !TECH_RADAR_TYPES.includes(entity.type as any)) {
      return { index, id: entity.id, message: `Недопустимое значение type: ${entity.type}` };
    }
    if (entity.subtype && !TECH_RADAR_SUBTYPES.includes(entity.subtype as any)) {
      return { index, id: entity.id, message: `Недопустимое значение subtype: ${entity.subtype}` };
    }
    if (entity.category && !TECH_RADAR_CATEGORIES.includes(entity.category as any)) {
      return { index, id: entity.id, message: `Недопустимое значение category: ${entity.category}` };
    }
    if (entity.maturity && !TECH_RADAR_MATURITY.includes(entity.maturity as any)) {
      return { index, id: entity.id, message: `Недопустимое значение maturity: ${entity.maturity}` };
    }
    if (entity.riskLevel && !TECH_RADAR_RISK_LEVEL.includes(entity.riskLevel as any)) {
      return { index, id: entity.id, message: `Недопустимое значение riskLevel: ${entity.riskLevel}` };
    }
    if (entity.supportStatus && !TECH_RADAR_SUPPORT_STATUS.includes(entity.supportStatus as any)) {
      return { index, id: entity.id, message: `Недопустимое значение supportStatus: ${entity.supportStatus}` };
    }
    if (entity.performanceImpact && !TECH_RADAR_PERFORMANCE_IMPACT.includes(entity.performanceImpact as any)) {
      return { index, id: entity.id, message: `Недопустимое значение performanceImpact: ${entity.performanceImpact}` };
    }
    if (entity.contributionFrequency && !TECH_RADAR_CONTRIBUTION_FREQUENCY.includes(entity.contributionFrequency as any)) {
      return { index, id: entity.id, message: `Недопустимое значение contributionFrequency: ${entity.contributionFrequency}` };
    }
    if (entity.costFactor && !TECH_RADAR_COST_FACTOR.includes(entity.costFactor as any)) {
      return { index, id: entity.id, message: `Недопустимое значение costFactor: ${entity.costFactor}` };
    }
    if (entity.businessCriticality && !TECH_RADAR_BUSINESS_CRITICALITY.includes(entity.businessCriticality as any)) {
      return { index, id: entity.id, message: `Недопустимое значение businessCriticality: ${entity.businessCriticality}` };
    }

    // Валидация resourceRequirements
    if (entity.resourceRequirements) {
      if (entity.resourceRequirements.cpu && !TECH_RADAR_CPU.includes(entity.resourceRequirements.cpu as any)) {
        return { index, id: entity.id, message: `Недопустимое значение resourceRequirements.cpu: ${entity.resourceRequirements.cpu}` };
      }
      if (entity.resourceRequirements.memory && !TECH_RADAR_MEMORY.includes(entity.resourceRequirements.memory as any)) {
        return { index, id: entity.id, message: `Недопустимое значение resourceRequirements.memory: ${entity.resourceRequirements.memory}` };
      }
      if (entity.resourceRequirements.storage && !TECH_RADAR_STORAGE.includes(entity.resourceRequirements.storage as any)) {
        return { index, id: entity.id, message: `Недопустимое значение resourceRequirements.storage: ${entity.resourceRequirements.storage}` };
      }
    }

    // Валидация числовых полей (конвертируем строки в числа для DECIMAL из БД)
    if (entity.adoptionRate !== undefined && entity.adoptionRate !== null) {
      const adoptionRateNum = typeof entity.adoptionRate === 'string' ? parseFloat(entity.adoptionRate) : entity.adoptionRate;
      if (typeof adoptionRateNum !== 'number' || isNaN(adoptionRateNum) || adoptionRateNum < 0 || adoptionRateNum > 1) {
        return { index, id: entity.id, message: 'adoptionRate должно быть числом от 0 до 1' };
      }
    }
    if (entity.popularityIndex !== undefined && entity.popularityIndex !== null) {
      const popularityIndexNum = typeof entity.popularityIndex === 'string' ? parseFloat(entity.popularityIndex) : entity.popularityIndex;
      if (typeof popularityIndexNum !== 'number' || isNaN(popularityIndexNum) || popularityIndexNum < 0 || popularityIndexNum > 1) {
        return { index, id: entity.id, message: 'popularityIndex должно быть числом от 0 до 1' };
      }
    }
    if (entity.communitySize !== undefined && entity.communitySize !== null) {
      if (typeof entity.communitySize !== 'number' || entity.communitySize < 0) {
        return { index, id: entity.id, message: 'communitySize должно быть неотрицательным числом' };
      }
    }

    // Валидация массивов
    const arrayFields = ['stakeholders', 'usageExamples', 'recommendedAlternatives', 'relatedTechnologies', 'securityVulnerabilities', 'complianceStandards'];
    for (const field of arrayFields) {
      if (entity[field] !== undefined && !Array.isArray(entity[field])) {
        return { index, id: entity.id, message: `Поле ${field} должно быть массивом` };
      }
    }

    // Валидация dependencies (массив объектов)
    if (entity.dependencies !== undefined && entity.dependencies !== null) {
      if (!Array.isArray(entity.dependencies)) {
        return { index, id: entity.id, message: 'dependencies должно быть массивом' };
      }
      for (let i = 0; i < entity.dependencies.length; i++) {
        const dep = entity.dependencies[i];
        if (!dep || typeof dep !== 'object') {
          return { index, id: entity.id, message: `Зависимость [${i}] должна быть объектом` };
        }
        if (typeof dep.name !== 'string' || typeof dep.version !== 'string') {
          return { index, id: entity.id, message: `Зависимость [${i}] должна иметь name и version (строки)` };
        }
      }
    }

    // Валидация compatibility (объект)
    if (entity.compatibility !== undefined && entity.compatibility !== null) {
      if (typeof entity.compatibility !== 'object' || Array.isArray(entity.compatibility)) {
        return { index, id: entity.id, message: 'compatibility должно быть объектом' };
      }
      const compatFields = ['os', 'browsers', 'frameworks'];
      for (const field of compatFields) {
        if (entity.compatibility[field] !== undefined && !Array.isArray(entity.compatibility[field])) {
          return { index, id: entity.id, message: `compatibility.${field} должно быть массивом` };
        }
      }
    }

    // Валидация vendorLockIn (boolean)
    if (entity.vendorLockIn !== undefined && typeof entity.vendorLockIn !== 'boolean') {
      return { index, id: entity.id, message: 'vendorLockIn должно быть булевым значением' };
    }

    // Валидация дат (формат YYYY-MM-DD)
    const dateFields = ['versionReleaseDate', 'firstAdded', 'lastUpdated', 'endOfLifeDate'];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const field of dateFields) {
      if (entity[field] !== undefined && entity[field] !== null && entity[field] !== '') {
        if (typeof entity[field] !== 'string' || !dateRegex.test(entity[field])) {
          return { index, id: entity.id, message: `Поле ${field} должно быть в формате YYYY-MM-DD` };
        }
      }
    }

    // Валидация URL полей
    const urlFields = ['documentationUrl', 'internalGuideUrl'];
    const urlRegex = /^https?:\/\/.+/;
    for (const field of urlFields) {
      if (entity[field] !== undefined && entity[field] !== null && entity[field] !== '') {
        if (typeof entity[field] !== 'string' || !urlRegex.test(entity[field])) {
          return { index, id: entity.id, message: `Поле ${field} должно быть корректным URL` };
        }
      }
    }

    return null;
  }

  /**
   * Импорт технологий из JSON массива
   * Использует параметризованные запросы TypeORM для защиты от SQL инъекций
   * 
   * Опции:
   * - skipExisting: true - пропускать существующие записи (по ID)
   * - updateExisting: true - обновлять существующие записи (по ID)
   * - если обе false (по умолчанию) - ошибка при конфликте ID
   */
  async importTechRadar(data: any[], options?: { skipExisting?: boolean; updateExisting?: boolean }): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    if (!Array.isArray(data)) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{ index: -1, message: 'Данные должны быть массивом' }],
      };
    }

    if (data.length === 0) {
      return result;
    }

    const skipExisting = options?.skipExisting ?? false;
    const updateExisting = options?.updateExisting ?? false;

    // Предварительная валидация всех записей
    for (let i = 0; i < data.length; i++) {
      const error = this.validateEntity(data[i], i);
      if (error) {
        result.errors.push(error);
      }
    }

    // Если есть критические ошибки валидации, прерываем импорт
    const hasCriticalErrors = result.errors.some(e => 
      e.message.includes('должно быть массивом') || 
      e.message.includes('должно быть объектом') ||
      e.message.includes('Отсутствует обязательное поле')
    );
    
    if (hasCriticalErrors) {
      result.success = false;
      return result;
    }

    // Импорт валидных записей с использованием транзакции
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < data.length; i++) {
        const entity = data[i];

        // Пропускаем записи с ошибками валидации
        if (result.errors.some(e => e.index === i)) {
          result.skipped++;
          continue;
        }

        try {
          // Проверяем существование записи по ID
          const existing = await queryRunner.manager.findOne(TechRadarEntity, {
            where: { id: entity.id },
          });

          if (existing) {
            if (skipExisting) {
              // Пропускаем существующую запись
              result.skipped++;
              continue;
            }

            if (updateExisting) {
              // Обновляем существующую запись
              // Исключаем системные поля из обновления
              const { createdAt, updatedAt, ...updateData } = entity;
              await queryRunner.manager.update(
                TechRadarEntity,
                entity.id,
                {
                  ...updateData,
                  updatedAt: new Date(),
                }
              );
              result.imported++;
              continue;
            }

            // Если ни skipExisting, ни updateExisting не указаны - ошибка конфликта
            result.errors.push({
              index: i,
              id: entity.id,
              message: `Запись с ID ${entity.id} уже существует. Укажите skipExisting=true для пропуска или updateExisting=true для обновления.`,
            });
            result.skipped++;
            continue;
          }

          // Создаем новую запись
          // Исключаем createdAt/updatedAt - они будут установлены автоматически
          const { createdAt, updatedAt, ...newData } = entity;
          const techRadarEntity = queryRunner.manager.create(TechRadarEntity, {
            ...newData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await queryRunner.manager.save(TechRadarEntity, techRadarEntity);
          result.imported++;
        } catch (error: any) {
          // Обработка ошибок (например, нарушение уникальности)
          const isDuplicateError = error.code === '23505' || error.message.includes('duplicate') || error.message.includes('уникальным');
          
          if (isDuplicateError && skipExisting) {
            // Если дубликат и указан skipExisting - пропускаем
            result.skipped++;
            continue;
          }

          result.errors.push({
            index: i,
            id: entity.id,
            message: error.message || 'Ошибка при сохранении записи',
          });
        }
      }

      // Если были ошибки при импорте (но не критические), откатываем транзакцию
      if (result.errors.length > 0) {
        await queryRunner.rollbackTransaction();
        result.success = false;
      } else {
        await queryRunner.commitTransaction();
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      result.success = false;
      result.errors.push({
        index: -1,
        message: `Ошибка транзакции: ${error.message}`,
      });
    } finally {
      await queryRunner.release();
    }

    return result;
  }

  /**
   * Экспорт всех технологий в JSON
   */
  async exportTechRadar(): Promise<TechRadarEntity[]> {
    return this.repository.find();
  }
}
