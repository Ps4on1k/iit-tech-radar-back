import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TechRadarEntity } from './TechRadarEntity';

/**
 * Вложения (файлы, скриншоты, документы)
 */
@Entity('tech_radar_attachments')
export class TechRadarAttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  techRadarId!: string;

  @ManyToOne(() => TechRadarEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'techRadarId' })
  techRadar!: TechRadarEntity;

  @Column('varchar')
  fileName!: string;

  @Column('varchar')
  originalName!: string;

  @Column('varchar')
  mimeType!: string;

  @Column('int')
  size!: number; // в байтах

  @Column('varchar', { nullable: true })
  description?: string;

  @Column('varchar', { nullable: true })
  uploadedBy?: string; // userId

  @CreateDateColumn()
  createdAt!: Date;
}
