import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TechRadarEntity } from './TechRadarEntity';

/**
 * Отзывы и оценки технологий
 */
@Entity('tech_radar_reviews')
export class TechRadarReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  techRadarId!: string;

  @ManyToOne(() => TechRadarEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'techRadarId' })
  techRadar!: TechRadarEntity;

  @Column('uuid', { nullable: true })
  userId?: string;

  @Column('int', { default: 5 })
  rating!: number; // 1-5 звёзд

  @Column('text', { nullable: true })
  comment?: string;

  @Column('varchar', { nullable: true })
  authorName?: string; // Если пользователь не авторизован

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
