import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTechRadarSubtypeEnum1772362420669 implements MigrationInterface {
    name = 'UpdateTechRadarSubtypeEnum1772362420669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // DROP старого типа ENUM (сначала нужно удалить зависимость - колонку)
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "subtype" TYPE character varying`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_subtype_enum"`);
        
        // Создаем новый ENUM с расширенным списком значений
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_subtype_enum" AS ENUM('фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 'DevOps', 'SaaS', 'библиотека', 'data engineering', 'AI', 'observability', 'базы данных', 'тестирование', 'автотесты', 'нагрузочные тесты', 'безопасность', 'очереди', 'desktop', 'прочее')`);
        
        // Возвращаем тип колонки к ENUM
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "subtype" TYPE "public"."tech_radar_subtype_enum" USING "subtype"::"public"."tech_radar_subtype_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Откат к старому ENUM
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "subtype" TYPE character varying`);
        await queryRunner.query(`DROP TYPE "public"."tech_radar_subtype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."tech_radar_subtype_enum" AS ENUM('фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 'DevOps', 'SaaS', 'библиотека')`);
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "subtype" TYPE "public"."tech_radar_subtype_enum" USING "subtype"::"public"."tech_radar_subtype_enum"`);
    }

}
