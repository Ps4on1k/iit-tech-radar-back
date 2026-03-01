import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeIdToUuid1772367103040 implements MigrationInterface {
    name = 'ChangeIdToUuid1772367103040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем временную колонку для хранения старых ID
        await queryRunner.query(`ALTER TABLE "tech_radar" ADD COLUMN "old_id" VARCHAR`);
        await queryRunner.query(`UPDATE "tech_radar" SET "old_id" = "id"`);
        
        // Удаляем первичный ключ
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP CONSTRAINT "PK_e646eaf75bbe7a3d177018a4a6b"`);
        
        // Меняем тип колонки id на UUID
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "id" TYPE UUID USING uuid_generate_v4()`);
        
        // Устанавливаем NOT NULL и default
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        
        // Восстанавливаем первичный ключ
        await queryRunner.query(`ALTER TABLE "tech_radar" ADD CONSTRAINT "PK_e646eaf75bbe7a3d177018a4a6b" PRIMARY KEY ("id")`);
        
        // Удаляем временную колонку
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP COLUMN "old_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Откат: возвращаем VARCHAR
        await queryRunner.query(`ALTER TABLE "tech_radar" DROP CONSTRAINT "PK_e646eaf75bbe7a3d177018a4a6b"`);
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "id" TYPE VARCHAR`);
        await queryRunner.query(`ALTER TABLE "tech_radar" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tech_radar" ADD CONSTRAINT "PK_e646eaf75bbe7a3d177018a4a6b" PRIMARY KEY ("id")`);
    }

}
