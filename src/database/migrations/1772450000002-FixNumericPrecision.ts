import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNumericPrecision1772450000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем текущий тип данных и изменяем только если нужно
    const result = await queryRunner.query(`
      SELECT column_name, numeric_precision, numeric_scale 
      FROM information_schema.columns 
      WHERE table_name = 'tech_radar' 
      AND column_name IN ('adoptionRate', 'popularityIndex')
    `);
    
    const needsMigration = result.some((row: any) => 
      row.numeric_precision !== 5 || row.numeric_scale !== 4
    );
    
    if (needsMigration) {
      // Изменяем точность полей adoptionRate и popularityIndex
      // numeric(5,4) позволяет хранить значения от 0.0000 до 9.9999
      await queryRunner.query(`
        ALTER TABLE "tech_radar" 
        ALTER COLUMN "adoptionRate" TYPE numeric(5,4)
      `);
      await queryRunner.query(`
        ALTER TABLE "tech_radar" 
        ALTER COLUMN "popularityIndex" TYPE numeric(5,4)
      `);
      console.log('Migration applied: changed adoptionRate and popularityIndex to numeric(5,4)');
    } else {
      console.log('Migration skipped: columns already have correct type numeric(5,4)');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем исходный тип
    await queryRunner.query(`
      ALTER TABLE "tech_radar" 
      ALTER COLUMN "adoptionRate" TYPE numeric(2,2)
    `);
    await queryRunner.query(`
      ALTER TABLE "tech_radar" 
      ALTER COLUMN "popularityIndex" TYPE numeric(2,2)
    `);
  }
}
