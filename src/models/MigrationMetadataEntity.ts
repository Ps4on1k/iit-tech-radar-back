import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Статусы миграции
 */
export enum MigrationStatus {
  BACKLOG = 'backlog',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/**
 * Метаданные для миграции технологии
 * Хранятся отдельно от основной сущности TechRadar
 */
@Entity('migration_metadata')
export class MigrationMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Связь с технологией TechRadar (UUID)
   */
  @Column('uuid', { unique: true, name: 'tech_radar_id' })
  techRadarId!: string;

  /**
   * Приоритет миграции (порядок сортировки)
   * Меньшее значение = выше приоритет
   */
  @Column('int', { default: 0 })
  priority!: number;

  /**
   * Статус миграции
   */
  @Column('varchar', { 
    length: 50,
    default: MigrationStatus.BACKLOG 
  })
  status!: MigrationStatus;

  /**
   * Прогресс выполнения (0-100)
   */
  @Column('int', { default: 0 })
  progress!: number;

  /**
   * Дата создания записи
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Дата последнего обновления
   */
  @UpdateDateColumn()
  updatedAt!: Date;
}
