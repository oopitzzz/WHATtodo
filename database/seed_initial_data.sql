-- ========================================
-- WHATtodo Initial Data Seed (DB-9)
-- 실행 전제: 스키마 및 ENUM, calendars 테이블 데이터 존재
-- 실행 방법 예시:
--    psql $POSTGRES_CONNECTION_STRING -f database/seed_initial_data.sql
--    또는 Supabase SQL Editor에 붙여 넣어 실행
-- ========================================

BEGIN;

-- 1) 샘플 사용자 3명 (중복 실행 대비 email 기준 UPSERT)
INSERT INTO users AS u (user_id, email, password_hash, nickname, notification_enabled)
VALUES
    ('00000000-0000-0000-0000-000000000101', 'alpha@example.com', '$2b$10$uCqD3VbEJYqHVpGJIUKqsu6mfaJMr8YgE5vC2E9eBvzQQLV7x5fL.', '알파', true),
    ('00000000-0000-0000-0000-000000000102', 'bravo@example.com', '$2b$10$uCqD3VbEJYqHVpGJIUKqsu6mfaJMr8YgE5vC2E9eBvzQQLV7x5fL.', '브라보', true),
    ('00000000-0000-0000-0000-000000000103', 'charlie@example.com', '$2b$10$uCqD3VbEJYqHVpGJIUKqsu6mfaJMr8YgE5vC2E9eBvzQQLV7x5fL.', '찰리', false)
ON CONFLICT (email) DO UPDATE
SET
    nickname = EXCLUDED.nickname,
    notification_enabled = EXCLUDED.notification_enabled
RETURNING user_id, email;

-- 2) 샘플 할일 10개 (우선순위/상태 다양하게 구성)
--    todo_id를 고정 UUID로 두어 중복 실행 시 UPSERT 보장
INSERT INTO todos (todo_id, user_id, title, description, priority, status, due_date, memo, completed_at, deleted_at)
VALUES
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '프로젝트 킥오프', '팀 킥오프 미팅 준비', 'HIGH', 'ACTIVE', '2025-11-27', '자료 정리', NULL, NULL),
    ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'UI 목업 리뷰', '디자인 팀 피드백 반영', 'NORMAL', 'COMPLETED', '2025-11-25', '피그마 링크 공유', '2025-11-25 14:00:00', NULL),
    ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', '데이터 모델 검토', 'ERD 리뷰 및 수정', 'HIGH', 'ACTIVE', '2025-11-28', '', NULL, NULL),
    ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000102', 'API 스펙 작성', 'Swagger 기반 CRUD 정의', 'NORMAL', 'ACTIVE', '2025-11-30', '', NULL, NULL),
    ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000102', '테스트 케이스 정리', 'Postman 테스트 작성', 'LOW', 'DELETED', NULL, '', NULL, '2025-11-24 10:00:00'),
    ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000102', '캘린더 데이터 입력', '2025년 공휴일 정리', 'HIGH', 'COMPLETED', '2025-11-26', '', '2025-11-26 18:30:00', NULL),
    ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000103', '알림 설정 확인', 'Notify 플로우 점검', 'NORMAL', 'ACTIVE', '2025-12-01', '', NULL, NULL),
    ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000103', '로그인 UI 개선', '에러 메세지 정리', 'LOW', 'ACTIVE', '2025-12-05', '', NULL, NULL),
    ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000103', '데일리 스탠드업', '팀 공유', 'NORMAL', 'COMPLETED', '2025-11-26', '', '2025-11-26 09:30:00', NULL),
    ('00000000-0000-0000-0000-00000000020A', '00000000-0000-0000-0000-000000000101', '에러 로그 분석', '서버 로그 점검', 'HIGH', 'ACTIVE', '2025-12-02', '', NULL, NULL)
ON CONFLICT (todo_id) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    priority = EXCLUDED.priority,
    status = EXCLUDED.status,
    due_date = EXCLUDED.due_date,
    memo = EXCLUDED.memo,
    completed_at = EXCLUDED.completed_at,
    deleted_at = EXCLUDED.deleted_at;

-- 3) 샘플 알림 5개
INSERT INTO notifications (notification_id, user_id, todo_id, type, message, scheduled_at, is_sent, sent_at)
VALUES
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 'D_MINUS_1', '내일 프로젝트 킥오프 준비', '2025-11-26 09:00:00', false, NULL),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000202', 'D_DAY', 'UI 목업 리뷰 일정입니다', '2025-11-25 09:00:00', true, '2025-11-25 09:05:00'),
    ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000204', 'D_MINUS_1', 'API 스펙 초안 확인', '2025-11-29 10:00:00', false, NULL),
    ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000206', 'D_DAY', '캘린더 데이터 입력 완료 확인', '2025-11-26 08:00:00', true, '2025-11-26 08:15:00'),
    ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000207', 'D_MINUS_1', '알림 설정 확인', '2025-11-30 09:00:00', false, NULL)
ON CONFLICT (notification_id) DO UPDATE
SET
    message = EXCLUDED.message,
    scheduled_at = EXCLUDED.scheduled_at,
    is_sent = EXCLUDED.is_sent,
    sent_at = EXCLUDED.sent_at;

COMMIT;
