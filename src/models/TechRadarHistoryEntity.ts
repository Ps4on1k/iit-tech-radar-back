import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TechRadarEntity } from './TechRadarEntity';

/**
 * История изменений технологий
 */
@Entity('tech_radar_history')
export class TechRadarHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  techRadarId!: string;

  @ManyToOne(() => TechRadarEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'techRadarId' })
  techRadar!: TechRadarEntity;

  @Column('uuid', { nullable: true })
  userId?: string;

  @Column('varchar')
  action!: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column('jsonb', { nullable: true })
  previousValues?: Record<string, any>; // предыдущие значения полей

  @Column('jsonb', { nullable: true })
  newValues?: Record<string, any>; // новые значения полей

  @Column('text', { nullable: true })
  comment?: string; // комментарий к изменению

  @CreateDateColumn()
  createdAt!: Date;
}
