-- ========================================
-- WHATtodo Calendar Seed Script (2025)
-- 실행 전제: calendars 테이블 및 day_of_week_enum 정의 완료
-- 실행 방법: psql -f database/seed_calendars_2025.sql
-- ========================================

BEGIN;

-- 2025년 전체 날짜 삽입 (존재 시 갱신)
INSERT INTO calendars (date, year, month, week, day_of_week)
SELECT
    gs::date AS date,
    EXTRACT(YEAR FROM gs)::int AS year,
    EXTRACT(MONTH FROM gs)::int AS month,
    EXTRACT(WEEK FROM gs)::int AS week,
    (
        CASE EXTRACT(DOW FROM gs)
            WHEN 0 THEN 'SUNDAY'
            WHEN 1 THEN 'MONDAY'
            WHEN 2 THEN 'TUESDAY'
            WHEN 3 THEN 'WEDNESDAY'
            WHEN 4 THEN 'THURSDAY'
            WHEN 5 THEN 'FRIDAY'
            WHEN 6 THEN 'SATURDAY'
        END
    )::day_of_week_enum AS day_of_week
FROM generate_series('2025-01-01'::date, '2025-12-31'::date, '1 day') AS gs
ON CONFLICT (date) DO UPDATE
SET
    year  = EXCLUDED.year,
    month = EXCLUDED.month,
    week  = EXCLUDED.week,
    day_of_week = EXCLUDED.day_of_week;

-- 2025년 공휴일 지정 (13일)
WITH holidays AS (
    SELECT * FROM (VALUES
        ('2025-01-01'::date, '신정'),
        ('2025-01-28'::date, '설날 연휴'),
        ('2025-01-29'::date, '설날'),
        ('2025-01-30'::date, '설날 연휴'),
        ('2025-03-01'::date, '삼일절'),
        ('2025-05-05'::date, '어린이날'),
        ('2025-05-06'::date, '어린이날 대체휴일'),
        ('2025-06-06'::date, '현충일'),
        ('2025-08-15'::date, '광복절'),
        ('2025-09-06'::date, '추석 연휴'),
        ('2025-09-07'::date, '추석'),
        ('2025-09-08'::date, '추석 연휴'),
        ('2025-10-03'::date, '개천절'),
        ('2025-10-09'::date, '한글날'),
        ('2025-12-25'::date, '성탄절')
    ) AS h(date, name)
)
UPDATE calendars AS c
SET
    is_holiday = true,
    holiday_name = h.name
FROM holidays AS h
WHERE c.date = h.date;

COMMIT;
