import { Request, Response } from 'express';
import { relatedTechRadarService, ReviewDto, TagDto, AttachmentDto, HistoryDto } from '../services/RelatedTechRadarService';
import { auditService } from '../services/AuditService';

export class RelatedTechRadarController {
  // === Отзывы ===

  getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const techRadarId = String(req.params.id);
      const reviews = await relatedTechRadarService.getReviews(techRadarId);
      const averageRating = await relatedTechRadarService.getAverageRating(techRadarId);

      res.json({
        reviews,
        averageRating,
        totalReviews: reviews.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при получении отзывов: ${error.message}` });
    }
  };

  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const techRadarId = String(req.params.id);
      const dto: ReviewDto = {
        ...req.body,
        techRadarId,
        userId: authReq.user?.id,
      };

      const review = await relatedTechRadarService.createReview(dto);

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'CREATE',
        entity: 'TechRadarReview',
        entityId: review.id,
        ipAddress: req.ip,
        details: { techRadarId, rating: dto.rating },
      });

      res.status(201).json(review);
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'CREATE',
        entity: 'TechRadarReview',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(400).json({ error: `Ошибка при создании отзыва: ${error.message}` });
    }
  };

  updateReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const id = String(req.params.reviewId);
      const dto: Partial<ReviewDto> = req.body;

      const review = await relatedTechRadarService.updateReview(id, dto);

      if (!review) {
        res.status(404).json({ error: 'Отзыв не найден' });
        return;
      }

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'UPDATE',
        entity: 'TechRadarReview',
        entityId: id,
        ipAddress: req.ip,
        details: { reviewId: id },
      });

      res.json(review);
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'UPDATE',
        entity: 'TechRadarReview',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(400).json({ error: `Ошибка при обновлении отзыва: ${error.message}` });
    }
  };

  deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const id = String(req.params.reviewId);

      const deleted = await relatedTechRadarService.deleteReview(id);

      if (!deleted) {
        res.status(404).json({ error: 'Отзыв не найден' });
        return;
      }

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadarReview',
        entityId: id,
        ipAddress: req.ip,
        details: { reviewId: id },
      });

      res.status(204).send();
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadarReview',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(500).json({ error: 'Ошибка при удалении отзыва' });
    }
  };

  // === Теги ===

  getTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const techRadarId = String(req.params.id);
      const tags = await relatedTechRadarService.getTags(techRadarId);
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при получении тегов: ${error.message}` });
    }
  };

  updateTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const techRadarId = String(req.params.id);
      const { tags }: { tags: string[] } = req.body;

      if (!Array.isArray(tags)) {
        res.status(400).json({ error: 'Теги должны быть массивом строк' });
        return;
      }

      const updatedTags = await relatedTechRadarService.addTags(techRadarId, tags);

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'UPDATE',
        entity: 'TechRadarTags',
        entityId: techRadarId,
        ipAddress: req.ip,
        details: { tagsCount: tags.length },
      });

      res.json(updatedTags);
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'UPDATE',
        entity: 'TechRadarTags',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(400).json({ error: `Ошибка при обновлении тегов: ${error.message}` });
    }
  };

  deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const id = String(req.params.tagId);

      const deleted = await relatedTechRadarService.deleteTag(id);

      if (!deleted) {
        res.status(404).json({ error: 'Тег не найден' });
        return;
      }

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadarTag',
        entityId: id,
        ipAddress: req.ip,
        details: { tagId: id },
      });

      res.status(204).send();
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadarTag',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(500).json({ error: 'Ошибка при удалении тега' });
    }
  };

  // === Вложения ===

  getAttachments = async (req: Request, res: Response): Promise<void> => {
    try {
      const techRadarId = String(req.params.id);
      const attachments = await relatedTechRadarService.getAttachments(techRadarId);
      res.json(attachments);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при получении вложений: ${error.message}` });
    }
  };

  createAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const techRadarId = String(req.params.id);
      const dto: AttachmentDto = {
        ...req.body,
        techRadarId,
        uploadedBy: authReq.user?.id,
      };

      const attachment = await relatedTechRadarService.createAttachment(dto);

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'CREATE',
        entity: 'TechRadarAttachment',
        entityId: attachment.id,
        ipAddress: req.ip,
        details: { techRadarId, fileName: dto.fileName },
      });

      res.status(201).json(attachment);
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'CREATE',
        entity: 'TechRadarAttachment',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(400).json({ error: `Ошибка при создании вложения: ${error.message}` });
    }
  };

  deleteAttachment = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const id = String(req.params.attachmentId);

      const deleted = await relatedTechRadarService.deleteAttachment(id);

      if (!deleted) {
        res.status(404).json({ error: 'Вложение не найдено' });
        return;
      }

      await auditService.logSuccess({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadarAttachment',
        entityId: id,
        ipAddress: req.ip,
        details: { attachmentId: id },
      });

      res.status(204).send();
    } catch (error: any) {
      const authReq = req as any;
      await auditService.logFailure({
        userId: authReq.user?.id,
        action: 'DELETE',
        entity: 'TechRadarAttachment',
        ipAddress: req.ip,
        details: { error: error.message },
      });
      res.status(500).json({ error: 'Ошибка при удалении вложения' });
    }
  };

  // === История ===

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const techRadarId = String(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await relatedTechRadarService.getHistory(techRadarId, limit);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при получении истории: ${error.message}` });
    }
  };

  logHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const dto: HistoryDto = {
        ...req.body,
        userId: authReq.user?.id,
      };

      const history = await relatedTechRadarService.logChange(dto);
      res.status(201).json(history);
    } catch (error: any) {
      res.status(400).json({ error: `Ошибка при записи истории: ${error.message}` });
    }
  };
}
