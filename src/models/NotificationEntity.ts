import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'tech-radar' | 'user' | 'system' | 'import';

/**
 * Внутренние уведомления для пользователей
 */
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('varchar')
  title!: string;

  @Column('text')
  message!: string;

  @Column('enum', { 
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  })
  type!: NotificationType;

  @Column('enum', {
    enum: ['tech-radar', 'user', 'system', 'import'],
    default: 'system'
  })
  category!: NotificationCategory;

  @Column('varchar', { nullable: true })
  actionUrl?: string; // Ссылка для перехода при клике

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>; // Дополнительные данные

  @Column('boolean', { default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
