import { ImportService, ImportResult } from '../../services/ImportService';
import { TechRadarEntity } from '../../models';

// Моки для TypeORM
const mockRepository = {
  manager: {
    connection: {
      createQueryRunner: jest.fn(),
    },
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  },
  find: jest.fn(),
};

jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: () => mockRepository,
  },
}));

describe('ImportService', () => {
  let importService: ImportService;

  const mockEntity: Partial<TechRadarEntity> = {
    id: 'tech-1',
    name: 'React',
    version: '18.2.0',
    type: 'фреймворк',
    subtype: 'фронтенд',
    category: 'adopt',
    maturity: 'stable',
    riskLevel: 'low',
    license: 'MIT',
    supportStatus: 'active',
    businessCriticality: 'high',
    firstAdded: '2023-01-15',
    owner: 'Frontend Team',
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn((entity, data) => ({ ...data })),
      update: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    importService = new ImportService();
    (mockRepository.manager.connection.createQueryRunner as jest.Mock).mockReturnValue(
      mockQueryRunner
    );
    // Сбрасываем findOne на возврат null по умолчанию
    mockQueryRunner.manager.findOne.mockResolvedValue(null);
  });

  describe('importTechRadar - валидация входных данных', () => {
    it('должен возвращать ошибку если данные не массив', async () => {
      const result = await importService.importTechRadar({} as any);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('массивом');
    });

    it('должен возвращать ошибку если данные пустые', async () => {
      const result = await importService.importTechRadar([]);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
    });
  });

  describe('importTechRadar - валидация сущностей', () => {
    it('должен возвращать ошибку при отсутствии обязательного поля id для skipExisting', async () => {
      const invalidData = [{ ...mockEntity, id: undefined }];

      const result = await importService.importTechRadar(invalidData as any, { skipExisting: true });

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('id'))).toBe(true);
    });

    it('должен возвращать ошибку при отсутствии обязательного поля id для updateExisting', async () => {
      const invalidData = [{ ...mockEntity, id: undefined }];

      const result = await importService.importTechRadar(invalidData as any, { updateExisting: true });

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('id'))).toBe(true);
    });

    it('должен проходить валидацию без id для новых записей', async () => {
      const validData = [{ ...mockEntity, id: undefined }];

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce({ ...validData[0], id: 'generated-uuid' });

      const result = await importService.importTechRadar(validData as any);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
    });

    it('должен возвращать ошибку при отсутствии обязательного поля name', async () => {
      const invalidData = [{ ...mockEntity, name: '' }];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('name'))).toBe(true);
    });

    it('должен возвращать ошибку если id не строка', async () => {
      const invalidData = [{ ...mockEntity, id: 123 } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('строкой'))).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого значения type', async () => {
      const invalidData = [{ ...mockEntity, type: 'неизвестный' } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('type'))).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого значения category', async () => {
      const invalidData = [{ ...mockEntity, category: 'invalid' } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('category'))).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого adoptionRate', async () => {
      const invalidData = [{ ...mockEntity, adoptionRate: 1.5 }];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('adoptionRate'))).toBe(true);
    });

    it('должен возвращать ошибку если дата в неверном формате', async () => {
      const invalidData = [{ ...mockEntity, firstAdded: '01-15-2023' } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('YYYY-MM-DD'))).toBe(true);
    });

    it('должен возвращать ошибку если URL некорректный', async () => {
      const invalidData = [{ ...mockEntity, documentationUrl: 'not-url' } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('URL'))).toBe(true);
    });
  });

  describe('importTechRadar - успешный импорт', () => {
    it('должен импортировать валидные данные', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockEntity);

      const result = await importService.importTechRadar([mockEntity]);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('должен импортировать несколько записей', async () => {
      const entities = [
        { ...mockEntity, id: 'tech-1' },
        { ...mockEntity, id: 'tech-2' },
        { ...mockEntity, id: 'tech-3' },
      ];

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce(entities[0]);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce(entities[1]);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce(entities[2]);

      const result = await importService.importTechRadar(entities);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(3);
    });
  });

  describe('importTechRadar - опции импорта', () => {
    it('должен пропускать существующие записи при skipExisting=true', async () => {
      // findOne возвращает существующую запись вместо null
      mockQueryRunner.manager.findOne.mockResolvedValue(mockEntity);

      const result = await importService.importTechRadar([mockEntity], { skipExisting: true });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(1);
      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('должен обновлять существующие записи при updateExisting=true', async () => {
      // findOne возвращает существующую запись
      mockQueryRunner.manager.findOne.mockResolvedValue(mockEntity);
      mockQueryRunner.manager.update.mockResolvedValue({} as any);

      const result = await importService.importTechRadar([mockEntity], { updateExisting: true });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(mockQueryRunner.manager.update).toHaveBeenCalled();
    });

    it('должен создавать новую запись если ID существует но не указаны skipExisting/updateExisting', async () => {
      // findOne возвращает существующую запись
      mockQueryRunner.manager.findOne.mockResolvedValue(mockEntity);
      mockQueryRunner.manager.save.mockResolvedValue({ ...mockEntity, id: 'new-uuid' });

      const result = await importService.importTechRadar([mockEntity], { skipExisting: false, updateExisting: false });

      // Новая запись создаётся с новым ID
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
    });
  });

  describe('importTechRadar - обработка ошибок', () => {
    it('должен откатывать транзакцию при ошибке', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('DB error'));

      const result = await importService.importTechRadar([mockEntity]);

      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('должен продолжать импорт при ошибке с отдельной записью', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('Save error'));
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockResolvedValueOnce({ ...mockEntity, id: 'tech-2' });

      const entities = [
        { ...mockEntity, id: 'tech-1' },
        { ...mockEntity, id: 'tech-2' },
      ];

      const result = await importService.importTechRadar(entities);

      expect(result.imported).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('exportTechRadar', () => {
    it('должен экспортировать все технологии', async () => {
      const mockEntities = [mockEntity, { ...mockEntity, id: 'tech-2' }];
      mockRepository.find.mockResolvedValueOnce(mockEntities);

      const result = await importService.exportTechRadar();

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('должен возвращать пустой массив если данных нет', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await importService.exportTechRadar();

      expect(result).toHaveLength(0);
    });
  });

  describe('validateEntity - дополнительные проверки', () => {
    it('должен валидировать resourceRequirements.cpu', async () => {
      const invalidData = [{ ...mockEntity, resourceRequirements: { cpu: 'extreme' } } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('cpu'))).toBe(true);
    });

    it('должен валидировать vendorLockIn как boolean', async () => {
      const invalidData = [{ ...mockEntity, vendorLockIn: 'yes' } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('vendorLockIn'))).toBe(true);
    });

    it('должен валидировать compatibility как объект', async () => {
      const invalidData = [{ ...mockEntity, compatibility: 'not-object' } as any];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('compatibility'))).toBe(true);
    });

    it('должен валидировать communitySize как неотрицательное число', async () => {
      const invalidData = [{ ...mockEntity, communitySize: -100 }];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('communitySize'))).toBe(true);
    });

    it('должен валидировать popularityIndex в диапазоне [0, 1]', async () => {
      const invalidData = [{ ...mockEntity, popularityIndex: 1.5 }];

      const result = await importService.importTechRadar(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('popularityIndex'))).toBe(true);
    });
  });
});
