-- ========================================
-- WHATtodo Schema Integrity Checklist (DB-8)
-- 실행 방법 예시:
--   psql $POSTGRES_CONNECTION_STRING -f database/verify_schema_integrity.sql
-- ========================================

\\echo '1) 테이블 목록 확인'
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\\echo '\\n2) ENUM 타입 확인'
SELECT typname
FROM pg_type
WHERE typname LIKE '%_enum'
ORDER BY typname;

\\echo '\\n3) 인덱스 목록 확인'
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\\echo '\\n4) 외래키 제약조건 확인'
SELECT conname, conrelid::regclass AS table_name, confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conname;

\\echo '\\n5) CASCADE 삭제 테스트 (읽기 전용: 트랜잭션 후 ROLLBACK)'
BEGIN;
-- 이메일은 실제 테스트에 사용하는 값으로 변경
DELETE FROM users WHERE email = 'test@example.com';
ROLLBACK;

\\echo '\\n6) 테스트 데이터 조회 예시'
SELECT * FROM users LIMIT 1;
SELECT * FROM todos LIMIT 1;
SELECT * FROM notifications LIMIT 1;
SELECT * FROM calendars ORDER BY date LIMIT 5;
