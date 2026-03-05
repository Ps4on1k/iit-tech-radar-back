# Инструкция по применению миграции FixNumericPrecision

## Проблема
Поля `adoptionRate` и `popularityIndex` имеют тип `numeric(2,2)`, что позволяет хранить только значения от 0.00 до 0.99.
Значения >= 1.0 вызывают ошибку "numeric field overflow".

## Решение
Изменить тип полей на `numeric(5,4)`, что позволяет хранить значения от 0.0000 до 9.9999.

## Применение на ВМ

### Вариант 1: Через npm скрипт (рекомендуется)
```bash
cd /path/to/tech-radar/fullstack/backend
npm run migrate:numeric
```

### Вариант 2: Через SQL напрямую
```bash
psql -h localhost -U postgres -d tech_radar -c "ALTER TABLE \"tech_radar\" ALTER COLUMN \"adoptionRate\" TYPE numeric(5,4);"
psql -h localhost -U postgres -d tech_radar -c "ALTER TABLE \"tech_radar\" ALTER COLUMN \"popularityIndex\" TYPE numeric(5,4);"
```

### Вариант 3: Через pgAdmin
1. Открыть pgAdmin и подключиться к базе tech_radar
2. Открыть Query Tool
3. Выполнить SQL:
```sql
ALTER TABLE "tech_radar" ALTER COLUMN "adoptionRate" TYPE numeric(5,4);
ALTER TABLE "tech_radar" ALTER COLUMN "popularityIndex" TYPE numeric(5,4);
```

## Проверка
После применения миграции выполните:
```sql
SELECT column_name, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'tech_radar' 
AND column_name IN ('adoptionRate', 'popularityIndex');
```

Ожидаемый результат:
- numeric_precision = 5
- numeric_scale = 4

## Для локальной разработки
Миграция уже применена локально. Повторное применение безопасно - скрипт проверит текущий тип и пропустит миграцию, если она уже применена.
