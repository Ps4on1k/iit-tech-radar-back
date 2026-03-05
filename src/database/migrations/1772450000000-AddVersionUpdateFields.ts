import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionUpdateFields1772450000000 implements MigrationInterface {
    name = 'AddVersionUpdateFields1772450000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавляем колонку versionToUpdate
        await queryRunner.query(`ALTER TABLE "tech_radar" ADD "versionToUpdate" character varying`);
        
        // Добавляем колонку versionUpdateDeadline
        await queryRunner.query(`ALTER TABLE "tech_radar" ADD "versionUpdateDeadline" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем колонку versionUpdateDeadline
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP COLUMN "versionUpdateDeadline"`);
        
        // Удаляем колонку versionToUpdate
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP COLUMN "versionToUpdate"`);
    }

}
