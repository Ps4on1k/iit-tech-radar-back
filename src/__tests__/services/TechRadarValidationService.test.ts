import { TechRadarValidationService, ValidationResult } from '../../services/TechRadarValidationService';
import { TechRadarEntity } from '../../models';

// Мок для AppDataSource и Repository
const mockRepository = {
  count: jest.fn(),
};

jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: () => mockRepository,
  },
}));

describe('TechRadarValidationService', () => {
  let validationService: TechRadarValidationService;

  beforeEach(() => {
    jest.clearAllMocks();
    validationService = new TechRadarValidationService();
  });

  const createValidEntity = (): Partial<TechRadarEntity> => ({
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
  });

  describe('validate - обязательные поля', () => {
    it('должен возвращать ошибку при отсутствии обязательного поля name', () => {
      const entity = { ...createValidEntity(), name: undefined } as any;
      const result = validationService.validate(entity, false);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('должен возвращать ошибку при пустом значении обязательного поля', () => {
      const entity = { ...createValidEntity(), version: '' };
      const result = validationService.validate(entity, false);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'version')).toBe(true);
    });

    it('должен проходить валидацию при наличии всех обязательных полей', () => {
      const entity = createValidEntity();
      const result = validationService.validate(entity, false);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validate - типы данных', () => {
    it('должен возвращать ошибку если id не строка', () => {
      const entity = { ...createValidEntity(), id: 123 } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'id' && e.message.includes('строкой'))).toBe(true);
    });

    it('должен возвращать ошибку если name не строка', () => {
      const entity = { ...createValidEntity(), name: 123 } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('должен возвращать ошибку если version не строка', () => {
      const entity = { ...createValidEntity(), version: 1.0 } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'version')).toBe(true);
    });

    it('должен проходить валидацию для корректных типов данных', () => {
      const entity: Partial<TechRadarEntity> = {
        id: 'tech-123',
        name: 'React',
        version: '18.2.0',
        description: 'UI библиотека',
        owner: 'Team',
        license: 'MIT',
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - enum поля', () => {
    it('должен возвращать ошибку для недопустимого значения type', () => {
      const entity = { ...createValidEntity(), type: 'неизвестный тип' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'type')).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого значения category', () => {
      const entity = { ...createValidEntity(), category: 'invalid' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'category')).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого значения maturity', () => {
      const entity = { ...createValidEntity(), maturity: 'unknown' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'maturity')).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого значения riskLevel', () => {
      const entity = { ...createValidEntity(), riskLevel: 'extreme' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'riskLevel')).toBe(true);
    });

    it('должен проходить валидацию для допустимых enum значений', () => {
      const validTypes = ['фреймворк', 'библиотека', 'язык программирования', 'инструмент'];
      const validCategories = ['adopt', 'trial', 'assess', 'hold', 'drop'];
      const validMaturity = ['experimental', 'active', 'stable', 'deprecated', 'end-of-life'];
      const validRiskLevels = ['low', 'medium', 'high', 'critical'];

      for (const type of validTypes) {
        for (const category of validCategories) {
          for (const maturity of validMaturity) {
            for (const riskLevel of validRiskLevels) {
              const entity = {
                ...createValidEntity(),
                type,
                category,
                maturity,
                riskLevel,
              };
              const result = validationService.validate(entity, true);
              expect(result.valid).toBe(true);
            }
          }
        }
      }
    });
  });

  describe('validate - числовые поля', () => {
    it('должен возвращать ошибку если adoptionRate < 0', () => {
      const entity = { ...createValidEntity(), adoptionRate: -0.1 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(true);
    });

    it('должен возвращать ошибку если adoptionRate > 1', () => {
      const entity = { ...createValidEntity(), adoptionRate: 1.1 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(true);
    });

    it('должен проходить валидацию для adoptionRate в диапазоне [0, 1]', () => {
      const entity = { ...createValidEntity(), adoptionRate: 0.75 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен проходить валидацию если adoptionRate не указано (undefined)', () => {
      const entity = { ...createValidEntity(), adoptionRate: undefined };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(false);
    });

    it('должен проходить валидацию если adoptionRate равно null', () => {
      const entity = { ...createValidEntity(), adoptionRate: null } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(false);
    });

    it('должен проходить валидацию если adoptionRate - пустая строка', () => {
      const entity = { ...createValidEntity(), adoptionRate: '' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(false);
    });

    it('должен проходить валидацию если adoptionRate - строка с числом', () => {
      const entity = { ...createValidEntity(), adoptionRate: '0.5' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(false);
    });

    it('должен возвращать ошибку если adoptionRate - невалидная строка', () => {
      const entity = { ...createValidEntity(), adoptionRate: 'abc' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'adoptionRate')).toBe(true);
    });

    it('должен возвращать ошибку если popularityIndex < 0', () => {
      const entity = { ...createValidEntity(), popularityIndex: -0.1 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(true);
    });

    it('должен возвращать ошибку если popularityIndex > 1', () => {
      const entity = { ...createValidEntity(), popularityIndex: 1.1 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(true);
    });

    it('должен проходить валидацию для popularityIndex в диапазоне [0, 1]', () => {
      const entity = { ...createValidEntity(), popularityIndex: 0.5 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен проходить валидацию если popularityIndex не указано (undefined)', () => {
      const entity = { ...createValidEntity(), popularityIndex: undefined };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(false);
    });

    it('должен проходить валидацию если popularityIndex равно null', () => {
      const entity = { ...createValidEntity(), popularityIndex: null } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(false);
    });

    it('должен проходить валидацию если popularityIndex - пустая строка', () => {
      const entity = { ...createValidEntity(), popularityIndex: '' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(false);
    });

    it('должен проходить валидацию если popularityIndex - строка с числом', () => {
      const entity = { ...createValidEntity(), popularityIndex: '0.5' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(false);
    });

    it('должен возвращать ошибку если popularityIndex - невалидная строка', () => {
      const entity = { ...createValidEntity(), popularityIndex: 'abc' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'popularityIndex')).toBe(true);
    });

    it('должен возвращать ошибку если communitySize < 0', () => {
      const entity = { ...createValidEntity(), communitySize: -100 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'communitySize')).toBe(true);
    });

    it('должен проходить валидацию для communitySize >= 0', () => {
      const entity = { ...createValidEntity(), communitySize: 1000 };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - массивы', () => {
    it('должен возвращать ошибку если stakeholders не массив', () => {
      const entity = { ...createValidEntity(), stakeholders: 'not array' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'stakeholders')).toBe(true);
    });

    it('должен проходить валидацию для корректных массивов', () => {
      const entity = {
        ...createValidEntity(),
        stakeholders: ['Team A', 'Team B'],
        usageExamples: ['Example 1'],
        relatedTechnologies: ['React', 'Redux'],
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - dependencies', () => {
    it('должен возвращать ошибку если dependencies не массив', () => {
      const entity = { ...createValidEntity(), dependencies: 'not array' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'dependencies')).toBe(true);
    });

    it('должен возвращать ошибку если элемент dependencies не объект', () => {
      const entity = {
        ...createValidEntity(),
        dependencies: ['string'],
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('объектом'))).toBe(true);
    });

    it('должен возвращать ошибку если у зависимости нет name или version', () => {
      const entity = {
        ...createValidEntity(),
        dependencies: [{ name: 'dep' }],
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('name и version'))).toBe(true);
    });

    it('должен проходить валидацию для корректных dependencies', () => {
      const entity = {
        ...createValidEntity(),
        dependencies: [
          { name: 'react', version: '18.2.0' },
          { name: 'react-dom', version: '18.2.0' },
        ],
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - compatibility', () => {
    it('должен возвращать ошибку если compatibility не объект', () => {
      const entity = { ...createValidEntity(), compatibility: 'not object' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'compatibility')).toBe(true);
    });

    it('должен возвращать ошибку если compatibility.os не массив', () => {
      const entity = {
        ...createValidEntity(),
        compatibility: { os: 'windows' },
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'compatibility.os')).toBe(true);
    });

    it('должен проходить валидацию для корректного compatibility', () => {
      const entity = {
        ...createValidEntity(),
        compatibility: {
          os: ['Windows', 'macOS', 'Linux'],
          browsers: ['Chrome', 'Firefox'],
          frameworks: ['React'],
        },
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - vendorLockIn', () => {
    it('должен возвращать ошибку если vendorLockIn не boolean', () => {
      const entity = { ...createValidEntity(), vendorLockIn: 'yes' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'vendorLockIn')).toBe(true);
    });

    it('должен проходить валидацию для boolean vendorLockIn', () => {
      const entity = { ...createValidEntity(), vendorLockIn: true };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - даты', () => {
    it('должен возвращать ошибку для некорректного формата даты', () => {
      const entity = { ...createValidEntity(), firstAdded: '01-15-2023' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'firstAdded')).toBe(true);
    });

    it('должен проходить валидацию для формата YYYY-MM-DD', () => {
      const entity = { ...createValidEntity(), firstAdded: '2023-01-15' };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - URL', () => {
    it('должен возвращать ошибку для некорректного URL', () => {
      const entity = { ...createValidEntity(), documentationUrl: 'not-url' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'documentationUrl')).toBe(true);
    });

    it('должен проходить валидацию для корректного HTTP URL', () => {
      const entity = {
        ...createValidEntity(),
        documentationUrl: 'https://react.dev',
        internalGuideUrl: 'http://internal.company.com/guide',
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - versionToUpdate', () => {
    it('должен проходить валидацию для корректной versionToUpdate', () => {
      const entity = {
        ...createValidEntity(),
        versionToUpdate: '2.0.0',
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен проходить валидацию если versionToUpdate не указано', () => {
      const entity = {
        ...createValidEntity(),
        versionToUpdate: undefined,
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен проходить валидацию если versionToUpdate равно null', () => {
      const entity = {
        ...createValidEntity(),
        versionToUpdate: null,
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен возвращать ошибку если versionToUpdate не строка', () => {
      const entity = {
        ...createValidEntity(),
        versionToUpdate: 123,
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'versionToUpdate')).toBe(true);
    });
  });

  describe('validate - versionUpdateDeadline', () => {
    it('должен проходить валидацию для корректного формата даты', () => {
      const entity = {
        ...createValidEntity(),
        versionUpdateDeadline: '2024-12-31',
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен проходить валидацию если versionUpdateDeadline не указано', () => {
      const entity = {
        ...createValidEntity(),
        versionUpdateDeadline: undefined,
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен проходить валидацию если versionUpdateDeadline равно null', () => {
      const entity = {
        ...createValidEntity(),
        versionUpdateDeadline: null,
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });

    it('должен возвращать ошибку для некорректного формата даты', () => {
      const entity = {
        ...createValidEntity(),
        versionUpdateDeadline: '2024/12/31',
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'versionUpdateDeadline')).toBe(true);
    });

    it('должен возвращать ошибку если versionUpdateDeadline не строка', () => {
      const entity = {
        ...createValidEntity(),
        versionUpdateDeadline: 1234567890,
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'versionUpdateDeadline')).toBe(true);
    });
  });

  describe('validate - resourceRequirements', () => {
    it('должен возвращать ошибку если resourceRequirements не объект', () => {
      const entity = { ...createValidEntity(), resourceRequirements: 'not object' } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'resourceRequirements')).toBe(true);
    });

    it('должен возвращать ошибку для недопустимого cpu значения', () => {
      const entity = {
        ...createValidEntity(),
        resourceRequirements: { cpu: 'extreme' },
      } as any;
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'resourceRequirements.cpu')).toBe(true);
    });

    it('должен проходить валидацию для корректных resourceRequirements', () => {
      const entity = {
        ...createValidEntity(),
        resourceRequirements: {
          cpu: 'средние' as const,
          memory: 'высокие' as const,
          storage: 'низкие' as const,
        },
      };
      const result = validationService.validate(entity, true);

      expect(result.valid).toBe(true);
    });
  });

  describe('validate - isUpdate флаг', () => {
    it('не должен требовать обязательные поля при isUpdate=true', () => {
      const entity: Partial<TechRadarEntity> = { id: '123' };
      const result = validationService.validate(entity, true);

      // При обновлении обязательные поля не проверяются
      // Ошибки могут быть только для предоставленных полей
      expect(result.errors.filter(e => e.message.includes('Отсутствует обязательное поле'))).toHaveLength(0);
    });

    it('должен требовать обязательные поля при isUpdate=false', () => {
      const entity: Partial<TechRadarEntity> = { id: '123' };
      const result = validationService.validate(entity, false);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Отсутствует обязательное поле'))).toBe(
        true
      );
    });
  });

  describe('existsById', () => {
    it('должен возвращать true если сущность существует', async () => {
      mockRepository.count.mockResolvedValueOnce(1);

      const result = await validationService.existsById('123');

      expect(result).toBe(true);
      expect(mockRepository.count).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('должен возвращать false если сущность не существует', async () => {
      mockRepository.count.mockResolvedValueOnce(0);

      const result = await validationService.existsById('123');

      expect(result).toBe(false);
    });
  });
});
