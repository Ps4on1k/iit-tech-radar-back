import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

/**
 * Снапшот завершенной миграции
 * Хранит историю завершенных миграций технологий
 */
@Entity('migration_snapshots')
export class MigrationSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Связь с технологией TechRadar (UUID)
   */
  @Column('uuid', { name: 'tech_radar_id' })
  techRadarId!: string;

  /**
   * Название технологии (на момент завершения миграции)
   */
  @Column('varchar', { length: 255 })
  techName!: string;

  /**
   * Версия технологии до миграции
   */
  @Column('varchar', { length: 100 })
  versionBefore!: string;

  /**
   * Версия технологии после миграции
   */
  @Column('varchar', { length: 100, nullable: true })
  versionAfter?: string;

  /**
   * Дедлайн обновления (на момент миграции)
   */
  @Column('date', { nullable: true })
  deadline?: string;

  /**
   * Путь обновления (описание шагов миграции)
   */
  @Column('text', { nullable: true })
  upgradePath?: string;

  /**
   * Рекомендованные альтернативы (JSON array строка)
   */
  @Column('text', { nullable: true })
  recommendedAlternatives?: string;

  /**
   * Приоритет миграции (на момент завершения)
   */
  @Column('int', { default: 0 })
  priority!: number;

  /**
   * Финальный прогресс (всегда 100 для завершенных)
   */
  @Column('int', { default: 100 })
  progress!: number;

  /**
   * Владелец миграции (на момент завершения)
   */
  @Column('uuid', { nullable: true, name: 'owner_id' })
  ownerId?: string;

  /**
   * Связь с пользователем-владельцем
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  /**
   * Дата завершения миграции
   */
  @CreateDateColumn()
  completedAt!: Date;

  /**
   * ID пользователя, завершившего миграцию (опционально)
   */
  @Column('uuid', { nullable: true, name: 'completed_by' })
  completedBy?: string;
}
