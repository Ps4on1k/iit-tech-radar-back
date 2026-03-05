import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  TECH_RADAR_TYPES,
  TECH_RADAR_SUBTYPES,
  TECH_RADAR_CATEGORIES,
  TECH_RADAR_MATURITY,
  TECH_RADAR_RISK_LEVEL,
  TECH_RADAR_SUPPORT_STATUS,
  TECH_RADAR_PERFORMANCE_IMPACT,
  TECH_RADAR_CONTRIBUTION_FREQUENCY,
  TECH_RADAR_COST_FACTOR,
  TECH_RADAR_BUSINESS_CRITICALITY,
  TECH_RADAR_CPU,
  TECH_RADAR_MEMORY,
  TECH_RADAR_STORAGE,
} from '../constants/tech-radar.constants';

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

  @Column('enum', { enum: TECH_RADAR_TYPES })
  type!: string;

  @Column('enum', {
    enum: TECH_RADAR_SUBTYPES,
    nullable: true,
  })
  subtype?: string;

  @Column('enum', { enum: TECH_RADAR_CATEGORIES })
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

  @Column('enum', { enum: TECH_RADAR_MATURITY })
  maturity!: string;

  @Column('enum', { enum: TECH_RADAR_RISK_LEVEL })
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

  @Column('enum', { enum: TECH_RADAR_SUPPORT_STATUS })
  supportStatus!: string;

  @Column('text', { nullable: true })
  upgradePath?: string;

  @Column('enum', {
    enum: TECH_RADAR_PERFORMANCE_IMPACT,
    nullable: true,
  })
  performanceImpact?: string;

  @Column('simple-json', { nullable: true })
  resourceRequirements?: {
    cpu: typeof TECH_RADAR_CPU[number];
    memory: typeof TECH_RADAR_MEMORY[number];
    storage: typeof TECH_RADAR_STORAGE[number];
  };

  @Column('simple-array', { nullable: true })
  securityVulnerabilities?: string[];

  @Column('simple-array', { nullable: true })
  complianceStandards?: string[];

  @Column('int', { nullable: true })
  communitySize?: number;

  @Column('enum', {
    enum: TECH_RADAR_CONTRIBUTION_FREQUENCY,
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
    enum: TECH_RADAR_COST_FACTOR,
    nullable: true,
  })
  costFactor?: string;

  @Column('boolean', { default: false })
  vendorLockIn!: boolean;

  @Column('enum', { enum: TECH_RADAR_BUSINESS_CRITICALITY })
  businessCriticality!: string;

  @Column('varchar', { nullable: true })
  versionToUpdate?: string;

  @Column('date', { nullable: true })
  versionUpdateDeadline?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
