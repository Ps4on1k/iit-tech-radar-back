import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { TechRadarEntity } from './TechRadarEntity';

/**
 * Теги технологий
 */
@Entity('tech_radar_tags')
@Unique(['techRadarId', 'name'])
export class TechRadarTagEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  techRadarId!: string;

  @ManyToOne(() => TechRadarEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'techRadarId' })
  techRadar!: TechRadarEntity;

  @Column('varchar', { length: 50 })
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
