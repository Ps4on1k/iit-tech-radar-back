import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionUpdateFields1772450000000 implements MigrationInterface {
    name = 'AddVersionUpdateFields1772450000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Проверяем существование колонок перед добавлением
        const columns = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'tech_radar' 
            AND column_name IN ('versionToUpdate', 'versionUpdateDeadline')
        `);
        
        const hasVersionToUpdate = columns.some((c: any) => c.column_name === 'versionToUpdate');
        const hasVersionUpdateDeadline = columns.some((c: any) => c.column_name === 'versionUpdateDeadline');

        // Добавляем колонку versionToUpdate только если её нет
        if (!hasVersionToUpdate) {
            await queryRunner.query(`ALTER TABLE "tech_radar" ADD "versionToUpdate" character varying`);
        }

        // Добавляем колонку versionUpdateDeadline только если её нет
        if (!hasVersionUpdateDeadline) {
            await queryRunner.query(`ALTER TABLE "tech_radar" ADD "versionUpdateDeadline" date`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем колонку versionUpdateDeadline только если она существует
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP COLUMN IF EXISTS "versionUpdateDeadline"`);

        // Удаляем колонку versionToUpdate только если она существует
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP COLUMN IF EXISTS "versionToUpdate"`);
    }

}
