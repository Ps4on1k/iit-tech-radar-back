import { Repository } from 'typeorm';
import { AppDataSource } from '../database';
import { NotificationEntity, NotificationType, NotificationCategory } from '../models/NotificationEntity';

export interface INotificationRepository {
  findById(id: string): Promise<NotificationEntity | undefined>;
  findByUserId(userId: string, limit?: number, isRead?: boolean): Promise<NotificationEntity[]>;
  create(data: Partial<NotificationEntity>): Promise<NotificationEntity>;
  markAsRead(id: string): Promise<NotificationEntity | undefined>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
  private repository: Repository<NotificationEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(NotificationEntity);
  }

  async findById(id: string): Promise<NotificationEntity | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByUserId(
    userId: string, 
    limit: number = 50,
    isRead?: boolean
  ): Promise<NotificationEntity[]> {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async create(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    const notification = this.repository.create(data);
    return this.repository.save(notification);
  }

  async markAsRead(id: string): Promise<NotificationEntity | undefined> {
    await this.repository.update(id, { isRead: true });
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update({ userId, isRead: false }, { isRead: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, isRead: false } });
  }
}
