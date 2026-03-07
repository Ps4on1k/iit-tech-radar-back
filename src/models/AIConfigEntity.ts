import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_config')
export class AIConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { unique: true })
  fieldName!: string;

  @Column('varchar')
  displayName!: string;

  @Column('boolean', { default: false })
  enabled!: boolean;

  @Column('text', { 
    default: 'Проведи анализ публичных доступных данных, сделай вывод и обнови это значение' 
  })
  prompt!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
