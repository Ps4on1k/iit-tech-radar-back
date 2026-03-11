import { Router } from 'express';
import { MigrationSnapshotController } from '../controllers/MigrationSnapshotController';

const router = Router();
const controller = new MigrationSnapshotController();

// Копируем роуты из контроллера
const snapshotRouter = controller.getRouter();

// Публичные роуты
snapshotRouter.get('/', controller['getAll']);
snapshotRouter.get('/statistics', controller['getStatistics']);
snapshotRouter.get('/:id', controller['getById']);

// Роуты для admin/manager
snapshotRouter.post('/complete/:techRadarId', controller['completeMigration']);
snapshotRouter.delete('/:id', controller['delete']);

// Роуты только для admin
snapshotRouter.delete('/all', controller['deleteAll']);

export default snapshotRouter;
