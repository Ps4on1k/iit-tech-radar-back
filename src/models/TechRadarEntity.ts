import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tech_radar')
export class TechRadarEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  name!: string;

  @Column('varchar')
  version!: string;

  @Column('varchar', { nullable: true })
  versionReleaseDate?: string;

  @Column('enum', {
    enum: ['фреймворк', 'библиотека', 'язык программирования', 'инструмент'],
  })
  type!: string;

  @Column('enum', {
    enum: ['фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 'DevOps', 'SaaS', 'библиотека', 'data engineering', 'AI', 'observability', 'базы данных', 'тестирование', 'автотесты', 'нагрузочные тесты', 'безопасность', 'очереди', 'desktop', 'прочее'],
    nullable: true,
  })
  subtype?: string;

  @Column('enum', {
    enum: ['adopt', 'trial', 'assess', 'hold', 'drop'],
  })
  category!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('date')
  firstAdded!: string;

  @Column('date', { nullable: true })
  lastUpdated?: string;

  @Column('varchar')
  owner!: string;

  @Column('simple-array', { nullable: true })
  stakeholders?: string[];

  @Column('simple-json', { nullable: true })
  dependencies?: Array<{ name: string; version: string; optional?: boolean }>;

  @Column('enum', {
    enum: ['experimental', 'active', 'stable', 'deprecated', 'end-of-life'],
  })
  maturity!: string;

  @Column('enum', {
    enum: ['low', 'medium', 'high', 'critical'],
  })
  riskLevel!: string;

  @Column('varchar')
  license!: string;

  @Column('simple-array', { nullable: true })
  usageExamples?: string[];

  @Column('varchar', { nullable: true })
  documentationUrl?: string;

  @Column('varchar', { nullable: true })
  internalGuideUrl?: string;

  @Column('decimal', { precision: 2, scale: 2, nullable: true })
  adoptionRate?: number;

  @Column('simple-array', { nullable: true })
  recommendedAlternatives?: string[];

  @Column('simple-array', { nullable: true })
  relatedTechnologies?: string[];

  @Column('date', { nullable: true })
  endOfLifeDate?: string;

  @Column('enum', {
    enum: ['active', 'limited', 'end-of-life', 'community-only'],
  })
  supportStatus!: string;

  @Column('text', { nullable: true })
  upgradePath?: string;

  @Column('enum', {
    enum: ['low', 'medium', 'high'],
    nullable: true,
  })
  performanceImpact?: string;

  @Column('simple-json', { nullable: true })
  resourceRequirements?: {
    cpu: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    memory: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    storage: 'минимальные' | 'низкие' | 'средние' | 'высокие';
  };

  @Column('simple-array', { nullable: true })
  securityVulnerabilities?: string[];

  @Column('simple-array', { nullable: true })
  complianceStandards?: string[];

  @Column('int', { nullable: true })
  communitySize?: number;

  @Column('enum', {
    enum: ['frequent', 'regular', 'occasional', 'rare', 'none'],
    nullable: true,
  })
  contributionFrequency?: string;

  @Column('decimal', { precision: 2, scale: 2, nullable: true })
  popularityIndex?: number;

  @Column('simple-json', { nullable: true })
  compatibility?: {
    os?: string[];
    browsers?: string[];
    frameworks?: string[];
  };

  @Column('enum', {
    enum: ['free', 'paid', 'subscription', 'enterprise'],
    nullable: true,
  })
  costFactor?: string;

  @Column('boolean', { default: false })
  vendorLockIn!: boolean;

  @Column('enum', {
    enum: ['low', 'medium', 'high', 'critical'],
  })
  businessCriticality!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
