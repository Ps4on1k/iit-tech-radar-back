import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Сущность для аудита критических операций
 * Логирует действия пользователей в системе
 */
@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: true })
  userId?: string;

  @Column('varchar')
  action!: string; // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'IMPORT', 'EXPORT'

  @Column('varchar')
  entity!: string; // 'TechRadar', 'User', 'Import'

  @Column('varchar', { nullable: true })
  entityId?: string;

  @Column('varchar', { nullable: true })
  ipAddress?: string;

  @Column('text', { nullable: true })
  details?: string; // JSON строка с деталями операции

  @Column('varchar')
  status!: string; // 'SUCCESS', 'FAILURE'

  @CreateDateColumn()
  timestamp!: Date;
}
