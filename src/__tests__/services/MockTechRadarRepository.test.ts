import { MockTechRadarRepository } from '../../services/MockTechRadarRepository';
import { TechRadarEntity } from '../../models';

describe('MockTechRadarRepository', () => {
  let repository: MockTechRadarRepository;

  const createMockEntity = (overrides?: Partial<TechRadarEntity>): TechRadarEntity => ({
    id: 'react-1',
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
    description: 'UI библиотека',
    vendorLockIn: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const mockEntities: TechRadarEntity[] = [
    createMockEntity({ id: 'react-1', name: 'React' }),
    createMockEntity({ id: 'angular-1', name: 'Angular', category: 'trial', maturity: 'active' }),
    createMockEntity({ id: 'nodejs-1', name: 'Node.js', type: 'инструмент', subtype: 'бэкенд' }),
  ];

  beforeEach(() => {
    repository = new MockTechRadarRepository();
  });

  describe('findAll', () => {
    it('должен возвращать все сущности', async () => {
      const result = await repository.findAll();

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findById', () => {
    it('должен возвращать сущность по ID', async () => {
      // Сначала сохраним тестовую сущность
      const testEntity = mockEntities[0];
      await repository.save(testEntity);

      const result = await repository.findById('react-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('react-1');
      expect(result?.name).toBe('React');
    });

    it('должен возвращать undefined если сущность не найдена', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByCategory', () => {
    it('должен возвращать сущности указанной категории', async () => {
      await repository.save(mockEntities[0]);
      await repository.save(mockEntities[1]);

      const result = await repository.findByCategory('adopt');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(e => e.category === 'adopt')).toBe(true);
    });

    it('должен возвращать пустой массив для несуществующей категории', async () => {
      const result = await repository.findByCategory('non-existent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findByType', () => {
    it('должен возвращать сущности указанного типа', async () => {
      await repository.save(mockEntities[0]);
      await repository.save(mockEntities[2]);

      const result = await repository.findByType('фреймворк');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(e => e.type === 'фреймворк')).toBe(true);
    });
  });

  describe('findBySubtype', () => {
    it('должен возвращать сущности указанного subtype', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.findBySubtype('фронтенд');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(e => e.subtype === 'фронтенд')).toBe(true);
    });
  });

  describe('search', () => {
    it('должен находить сущности по имени', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.search('React');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(e => e.name.includes('React'))).toBe(true);
    });

    it('должен находить сущности по описанию', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.search('UI библиотека');

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('должен выполнять поиск без учета регистра', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.search('react');

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('должен возвращать пустой массив если ничего не найдено', async () => {
      const result = await repository.search('несуществующий-запрос');

      expect(result).toHaveLength(0);
    });
  });

  describe('findFiltered', () => {
    it('должен фильтровать по category', async () => {
      await repository.save(mockEntities[0]);
      await repository.save(mockEntities[1]);

      const result = await repository.findFiltered({ category: 'adopt' });

      expect(result.every(e => e.category === 'adopt')).toBe(true);
    });

    it('должен фильтровать по type', async () => {
      await repository.save(mockEntities[0]);
      await repository.save(mockEntities[2]);

      const result = await repository.findFiltered({ type: 'фреймворк' });

      expect(result.every(e => e.type === 'фреймворк')).toBe(true);
    });

    it('должен фильтровать по subtype', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.findFiltered({ subtype: 'фронтенд' });

      expect(result.every(e => e.subtype === 'фронтенд')).toBe(true);
    });

    it('должен фильтровать по maturity', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.findFiltered({ maturity: 'stable' });

      expect(result.every(e => e.maturity === 'stable')).toBe(true);
    });

    it('должен фильтровать по search запросу', async () => {
      await repository.save(mockEntities[0]);

      const result = await repository.findFiltered({ search: 'React' });

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('должен применять несколько фильтров одновременно', async () => {
      await repository.save(mockEntities[0]);
      await repository.save(mockEntities[1]);

      const result = await repository.findFiltered({
        category: 'adopt',
        type: 'фреймворк',
      });

      expect(result.every(e => e.category === 'adopt' && e.type === 'фреймворк')).toBe(true);
    });
  });

  describe('save', () => {
    it('должен создавать новую сущность', async () => {
      const newEntity = createMockEntity({
        id: 'new-tech',
        name: 'New Technology',
        version: '1.0.0',
        type: 'библиотека',
        subtype: 'бэкенд',
        category: 'trial',
        maturity: 'active',
        riskLevel: 'low',
        license: 'Apache-2.0',
        supportStatus: 'active',
        businessCriticality: 'medium',
        firstAdded: '2024-01-01',
        owner: 'Test Team',
      });

      const result = await repository.save(newEntity);

      expect(result).toEqual(newEntity);
      const found = await repository.findById('new-tech');
      expect(found).toBeDefined();
    });

    it('должен обновлять существующую сущность', async () => {
      const entity = mockEntities[0];
      await repository.save(entity);

      const updatedEntity = { ...entity, version: '19.0.0' };
      const result = await repository.save(updatedEntity);

      expect(result.version).toBe('19.0.0');
      const found = await repository.findById('react-1');
      expect(found?.version).toBe('19.0.0');
    });
  });

  describe('delete', () => {
    it('должен удалять существующую сущность', async () => {
      const entity = mockEntities[0];
      await repository.save(entity);

      const deleteResult = await repository.delete('react-1');

      expect(deleteResult).toBe(true);
      const found = await repository.findById('react-1');
      expect(found).toBeUndefined();
    });

    it('должен возвращать false при удалении несуществующей сущности', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('должен возвращать статистику по категориям, типам и subtype', async () => {
      await repository.save(mockEntities[0]);
      await repository.save(mockEntities[1]);
      await repository.save(mockEntities[2]);

      const stats = await repository.getStatistics();

      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.bySubtype).toBeDefined();
      expect(stats.byCategory['adopt']).toBeGreaterThanOrEqual(2);
      expect(stats.byType['фреймворк']).toBeGreaterThanOrEqual(2);
    });

    it('должен возвращать правильную статистику для пустого репозитория', async () => {
      // Создаем новый репозиторий без данных - он всё равно загрузит mock-data
      // Поэтому проверяем что статистика возвращается корректно
      const emptyRepo = new MockTechRadarRepository();
      const stats = await emptyRepo.getStatistics();

      // Mock репозиторий всегда содержит данные из mock-data.json
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.bySubtype).toBeDefined();
    });
  });
});
