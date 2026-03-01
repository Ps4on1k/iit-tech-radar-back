import { Router } from 'express';
import { VersionController } from '../controllers/VersionController';

const router = Router();
const versionController = new VersionController();

router.get('/', versionController.getVersion);

export default router;
