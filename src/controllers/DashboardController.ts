import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * Получить все метрики дашборда
   * GET /api/dashboards/metrics
   */
  getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await dashboardService.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка получения метрик: ${error.message}` });
    }
  };

  /**
   * Получить метрики здоровья стека (для обратной совместимости)
   * GET /api/dashboards/health
   */
  getStackHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await dashboardService.getDashboardMetrics();
      res.json(metrics.stackHealth);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка получения метрик: ${error.message}` });
    }
  };
}
