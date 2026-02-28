import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1772269657112 implements MigrationInterface {
    name = 'InitialMigration1772269657112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_type_enum" AS ENUM('фреймворк', 'библиотека', 'язык программирования', 'инструмент')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_subtype_enum" AS ENUM('фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 'DevOps', 'SaaS', 'библиотека')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_category_enum" AS ENUM('adopt', 'trial', 'assess', 'hold', 'drop')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_maturity_enum" AS ENUM('experimental', 'active', 'stable', 'deprecated', 'end-of-life')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_risklevel_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_supportstatus_enum" AS ENUM('active', 'limited', 'end-of-life', 'community-only')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_performanceimpact_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_contributionfrequency_enum" AS ENUM('frequent', 'regular', 'occasional', 'rare', 'none')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_costfactor_enum" AS ENUM('free', 'paid', 'subscription', 'enterprise')`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_businesscriticality_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TABLE "tech_radar" ("id" character varying NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "versionReleaseDate" character varying, "type" "public"."tech_radar_type_enum" NOT NULL, "subtype" "public"."tech_radar_subtype_enum", "category" "public"."tech_radar_category_enum" NOT NULL, "description" text, "firstAdded" date NOT NULL, "lastUpdated" date, "owner" character varying NOT NULL, "stakeholders" text, "dependencies" text, "maturity" "public"."tech_radar_maturity_enum" NOT NULL, "riskLevel" "public"."tech_radar_risklevel_enum" NOT NULL, "license" character varying NOT NULL, "usageExamples" text, "documentationUrl" character varying, "internalGuideUrl" character varying, "adoptionRate" numeric(2,2), "recommendedAlternatives" text, "relatedTechnologies" text, "endOfLifeDate" date, "supportStatus" "public"."tech_radar_supportstatus_enum" NOT NULL, "upgradePath" text, "performanceImpact" "public"."tech_radar_performanceimpact_enum", "resourceRequirements" text, "securityVulnerabilities" text, "complianceStandards" text, "communitySize" integer, "contributionFrequency" "public"."tech_radar_contributionfrequency_enum", "popularityIndex" numeric(2,2), "compatibility" text, "costFactor" "public"."tech_radar_costfactor_enum", "vendorLockIn" boolean NOT NULL DEFAULT false, "businessCriticality" "public"."tech_radar_businesscriticality_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e646eaf75bbe7a3d177018a4a6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "tech_radar"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_businesscriticality_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_costfactor_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_contributionfrequency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_performanceimpact_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_supportstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_risklevel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_maturity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_subtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_type_enum"`);
    }

}
