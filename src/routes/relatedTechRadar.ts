import { Router } from 'express';
import { RelatedTechRadarController } from '../controllers/RelatedTechRadarController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const controller = new RelatedTechRadarController();

// Отзывы
router.get('/:id/reviews', controller.getReviews);
router.post('/:id/reviews', authenticate, controller.createReview);
router.put('/:id/reviews/:reviewId', authenticate, controller.updateReview);
router.delete('/:id/reviews/:reviewId', authenticate, controller.deleteReview);

// Теги
router.get('/:id/tags', controller.getTags);
router.put('/:id/tags', authenticate, requireRole('admin', 'manager'), controller.updateTags);
router.delete('/:id/tags/:tagId', authenticate, requireRole('admin', 'manager'), controller.deleteTag);

// Вложения
router.get('/:id/attachments', controller.getAttachments);
router.post('/:id/attachments', authenticate, requireRole('admin', 'manager'), controller.createAttachment);
router.delete('/:id/attachments/:attachmentId', authenticate, requireRole('admin', 'manager'), controller.deleteAttachment);

// История
router.get('/:id/history', authenticate, controller.getHistory);
router.post('/:id/history', authenticate, requireRole('admin'), controller.logHistory);

export default router;
