import { AppDataSource } from '../database';
import { TechRadarEntity } from '../models/TechRadarEntity';
import { Repository } from 'typeorm';

/**
 * Интерфейс для метрик дашборда
 */
export interface DashboardMetrics {
  stackHealth: {
    badTechnologiesPercent: number;
    technologiesWithVulnerabilitiesPercent: number;
    technologiesNeedingUpdatePercent: number;
    totalTechnologies: number;
  };
  cto: {
    adoptTrialPercent: number;
    holdDropPercent: number;
    technologiesByCategory: Record<string, number>;
  };
  devops: {
    documentationPercent: number;
    internalGuidePercent: number;
    vendorLockInPercent: number;
  };
  infosec: {
    vulnerabilitiesCount: number;
    highRiskPercent: number;
    criticalRiskPercent: number;
  };
  development: {
    technologiesByType: Record<string, number>;
    examplesPercent: number;
    averageCommunitySize: number;
  };
}

/**
 * Сервис для расчета метрик дашборда
 */
export class DashboardService {
  private repository: Repository<TechRadarEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TechRadarEntity);
  }

  /**
   * Получить все метрики дашборда
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const allTechnologies = await this.repository.find();
      const total = allTechnologies.length;

      if (total === 0) {
        return this.getEmptyMetrics();
      }

      // Stack Health
      const badCount = allTechnologies.filter(t => t.category === 'hold' || t.category === 'drop').length;
      const vulnCount = allTechnologies.filter(t => t.securityVulnerabilities && t.securityVulnerabilities.length > 0).length;
      const updateCount = allTechnologies.filter(t => t.versionToUpdate || t.maturity === 'deprecated' || t.maturity === 'end-of-life').length;

      // CTO Metrics
      const adoptTrialCount = allTechnologies.filter(t => t.category === 'adopt' || t.category === 'trial').length;
      const holdDropCount = badCount;
      const byCategory = allTechnologies.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // DevOps Metrics
      const withDoc = allTechnologies.filter(t => t.documentationUrl).length;
      const withInternal = allTechnologies.filter(t => t.internalGuideUrl).length;
      const vendorLock = allTechnologies.filter(t => t.vendorLockIn).length;

      // InfoSec Metrics
      const totalVulns = allTechnologies.reduce((sum, t) => sum + (t.securityVulnerabilities?.length || 0), 0);
      const highRisk = allTechnologies.filter(t => t.riskLevel === 'high').length;
      const criticalRisk = allTechnologies.filter(t => t.riskLevel === 'critical').length;

      // Development Metrics
      const byType = allTechnologies.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const withExamples = allTechnologies.filter(t => t.usageExamples && t.usageExamples.length > 0).length;
      const avgCommunity = allTechnologies.reduce((sum, t) => sum + (t.communitySize || 0), 0) / total;

      return {
        stackHealth: {
          badTechnologiesPercent: Math.round((badCount / total) * 1000) / 10,
          technologiesWithVulnerabilitiesPercent: Math.round((vulnCount / total) * 1000) / 10,
          technologiesNeedingUpdatePercent: Math.round((updateCount / total) * 1000) / 10,
          totalTechnologies: total,
        },
        cto: {
          adoptTrialPercent: Math.round((adoptTrialCount / total) * 1000) / 10,
          holdDropPercent: Math.round((holdDropCount / total) * 1000) / 10,
          technologiesByCategory: byCategory,
        },
        devops: {
          documentationPercent: Math.round((withDoc / total) * 1000) / 10,
          internalGuidePercent: Math.round((withInternal / total) * 1000) / 10,
          vendorLockInPercent: Math.round((vendorLock / total) * 1000) / 10,
        },
        infosec: {
          vulnerabilitiesCount: totalVulns,
          highRiskPercent: Math.round((highRisk / total) * 1000) / 10,
          criticalRiskPercent: Math.round((criticalRisk / total) * 1000) / 10,
        },
        development: {
          technologiesByType: byType,
          examplesPercent: Math.round((withExamples / total) * 1000) / 10,
          averageCommunitySize: Math.round(avgCommunity),
        },
      };
    } catch (error: any) {
      throw new Error(`Ошибка расчета метрик: ${error.message}`);
    }
  }

  /**
   * Получить пустые метрики
   */
  private getEmptyMetrics(): DashboardMetrics {
    return {
      stackHealth: {
        badTechnologiesPercent: 0,
        technologiesWithVulnerabilitiesPercent: 0,
        technologiesNeedingUpdatePercent: 0,
        totalTechnologies: 0,
      },
      cto: {
        adoptTrialPercent: 0,
        holdDropPercent: 0,
        technologiesByCategory: {},
      },
      devops: {
        documentationPercent: 0,
        internalGuidePercent: 0,
        vendorLockInPercent: 0,
      },
      infosec: {
        vulnerabilitiesCount: 0,
        highRiskPercent: 0,
        criticalRiskPercent: 0,
      },
      development: {
        technologiesByType: {},
        examplesPercent: 0,
        averageCommunitySize: 0,
      },
    };
  }
}
