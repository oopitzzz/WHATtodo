-- ========================================
-- WHATtodo Database Schema
-- Version: 1.0
-- Created: 2025-11-26
-- Database: PostgreSQL 14+
-- Hosting: Supabase
-- ========================================

-- ========================================
-- 1. ENUM 타입 생성
-- ========================================

-- 할일 우선순위 (높음, 보통, 낮음)
CREATE TYPE priority_enum AS ENUM ('HIGH', 'NORMAL', 'LOW');

-- 할일 상태 (활성, 완료, 삭제)
CREATE TYPE status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'DELETED');

-- 알림 유형 (D-1, D-day)
CREATE TYPE notification_type_enum AS ENUM ('D_MINUS_1', 'D_DAY');

-- 요일
CREATE TYPE day_of_week_enum AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);

-- ========================================
-- 2. 테이블 생성
-- ========================================

-- ---------------------------------------
-- 2.1 users (사용자) 테이블
-- ---------------------------------------
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    profile_image_url VARCHAR(500),
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    -- 제약조건
    CONSTRAINT chk_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT chk_nickname_length
        CHECK (char_length(nickname) BETWEEN 2 AND 20)
);

-- 테이블 주석
COMMENT ON TABLE users IS '사용자 계정 및 프로필 정보';
COMMENT ON COLUMN users.user_id IS '사용자 고유 식별자 (UUID)';
COMMENT ON COLUMN users.email IS '이메일 주소 (로그인 ID)';
COMMENT ON COLUMN users.password_hash IS 'bcrypt 해시된 비밀번호';
COMMENT ON COLUMN users.nickname IS '사용자 닉네임 (2-20자)';
COMMENT ON COLUMN users.profile_image_url IS '프로필 사진 URL';
COMMENT ON COLUMN users.notification_enabled IS '알림 수신 활성화 여부';
COMMENT ON COLUMN users.created_at IS '가입 일시';
COMMENT ON COLUMN users.last_login_at IS '최종 로그인 일시';

-- ---------------------------------------
-- 2.2 todos (할일) 테이블
-- ---------------------------------------
CREATE TABLE todos (
    todo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    priority priority_enum DEFAULT 'NORMAL',
    status status_enum DEFAULT 'ACTIVE',
    due_date DATE,
    memo TEXT,
    completed_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 외래키
    CONSTRAINT fk_todos_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- 제약조건
    CONSTRAINT chk_title_length
        CHECK (char_length(title) BETWEEN 1 AND 100),
    CONSTRAINT chk_completed_status
        CHECK (
            (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
            (status != 'COMPLETED' AND completed_at IS NULL)
        ),
    CONSTRAINT chk_deleted_status
        CHECK (
            (status = 'DELETED' AND deleted_at IS NOT NULL) OR
            (status != 'DELETED' AND deleted_at IS NULL)
        )
);

-- 테이블 주석
COMMENT ON TABLE todos IS '사용자의 할일 항목';
COMMENT ON COLUMN todos.todo_id IS '할일 고유 식별자 (UUID)';
COMMENT ON COLUMN todos.user_id IS '사용자 ID (외래키)';
COMMENT ON COLUMN todos.title IS '할일 제목 (1-100자)';
COMMENT ON COLUMN todos.description IS '할일 상세 설명';
COMMENT ON COLUMN todos.priority IS '우선순위 (HIGH/NORMAL/LOW)';
COMMENT ON COLUMN todos.status IS '상태 (ACTIVE/COMPLETED/DELETED)';
COMMENT ON COLUMN todos.due_date IS '마감일';
COMMENT ON COLUMN todos.memo IS '메모';
COMMENT ON COLUMN todos.completed_at IS '완료 일시';
COMMENT ON COLUMN todos.deleted_at IS '삭제 일시 (휴지통)';
COMMENT ON COLUMN todos.created_at IS '생성 일시';
COMMENT ON COLUMN todos.updated_at IS '수정 일시';

-- ---------------------------------------
-- 2.3 notifications (알림) 테이블
-- ---------------------------------------
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    todo_id UUID NOT NULL,
    type notification_type_enum NOT NULL,
    message VARCHAR(500) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 외래키
    CONSTRAINT fk_notifications_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_todos
        FOREIGN KEY (todo_id)
        REFERENCES todos(todo_id)
        ON DELETE CASCADE,

    -- 제약조건
    CONSTRAINT chk_sent_consistency
        CHECK (
            (is_sent = true AND sent_at IS NOT NULL) OR
            (is_sent = false AND sent_at IS NULL)
        ),
    CONSTRAINT chk_scheduled_future
        CHECK (scheduled_at >= created_at)
);

-- 테이블 주석
COMMENT ON TABLE notifications IS '할일 마감일 알림';
COMMENT ON COLUMN notifications.notification_id IS '알림 고유 식별자 (UUID)';
COMMENT ON COLUMN notifications.user_id IS '사용자 ID (외래키)';
COMMENT ON COLUMN notifications.todo_id IS '할일 ID (외래키)';
COMMENT ON COLUMN notifications.type IS '알림 유형 (D_MINUS_1: D-1, D_DAY: D-day)';
COMMENT ON COLUMN notifications.message IS '알림 메시지';
COMMENT ON COLUMN notifications.scheduled_at IS '발송 예정 시각';
COMMENT ON COLUMN notifications.is_sent IS '발송 완료 여부';
COMMENT ON COLUMN notifications.sent_at IS '발송 완료 시각';
COMMENT ON COLUMN notifications.created_at IS '생성 일시';

-- ---------------------------------------
-- 2.4 calendars (캘린더) 테이블
-- ---------------------------------------
CREATE TABLE calendars (
    date DATE PRIMARY KEY,
    is_holiday BOOLEAN DEFAULT false,
    holiday_name VARCHAR(100),
    description VARCHAR(500),
    year INT NOT NULL,
    month INT NOT NULL,
    week INT NOT NULL,
    day_of_week day_of_week_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT chk_month_range
        CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT chk_week_range
        CHECK (week BETWEEN 1 AND 53),
    CONSTRAINT chk_holiday_name
        CHECK (
            (is_holiday = true AND holiday_name IS NOT NULL) OR
            (is_holiday = false)
        )
);

-- 테이블 주석
COMMENT ON TABLE calendars IS '캘린더 및 공휴일 정보';
COMMENT ON COLUMN calendars.date IS '날짜 (PK)';
COMMENT ON COLUMN calendars.is_holiday IS '공휴일 여부';
COMMENT ON COLUMN calendars.holiday_name IS '공휴일 명칭';
COMMENT ON COLUMN calendars.description IS '설명';
COMMENT ON COLUMN calendars.year IS '연도';
COMMENT ON COLUMN calendars.month IS '월 (1-12)';
COMMENT ON COLUMN calendars.week IS '주차 (1-53)';
COMMENT ON COLUMN calendars.day_of_week IS '요일';
COMMENT ON COLUMN calendars.created_at IS '생성 일시';

-- ========================================
-- 3. 인덱스 생성
-- ========================================

-- ---------------------------------------
-- 3.1 users 테이블 인덱스
-- ---------------------------------------
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ---------------------------------------
-- 3.2 todos 테이블 인덱스
-- ---------------------------------------
-- 단일 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_status ON todos(status);

-- 복합 인덱스 (성능 최적화)
CREATE INDEX idx_todos_user_status ON todos(user_id, status);
CREATE INDEX idx_todos_user_due_date ON todos(user_id, due_date);

-- 부분 인덱스 (PARTIAL INDEX)
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at)
WHERE status = 'DELETED';

-- ---------------------------------------
-- 3.3 notifications 테이블 인덱스
-- ---------------------------------------
-- 단일 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_todo_id ON notifications(todo_id);

-- 복합 인덱스
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at, is_sent);

-- 부분 인덱스 (미발송 알림 조회 최적화)
CREATE INDEX idx_notifications_pending ON notifications(scheduled_at)
WHERE is_sent = false;

-- ---------------------------------------
-- 3.4 calendars 테이블 인덱스
-- ---------------------------------------
-- 복합 인덱스
CREATE INDEX idx_calendars_year_month ON calendars(year, month);

-- 부분 인덱스 (공휴일만 조회 최적화)
CREATE INDEX idx_calendars_is_holiday ON calendars(is_holiday)
WHERE is_holiday = true;

-- ========================================
-- 4. 트리거 및 함수
-- ========================================

-- ---------------------------------------
-- 4.1 updated_at 자동 갱신 함수
-- ---------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'updated_at 컬럼 자동 갱신';

-- ---------------------------------------
-- 4.2 todos 테이블 updated_at 트리거
-- ---------------------------------------
CREATE TRIGGER trigger_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER trigger_todos_updated_at ON todos IS 'todos 테이블 수정 시 updated_at 자동 갱신';

-- ========================================
-- 5. 초기 데이터 (선택사항)
-- ========================================

-- 샘플 데이터 삽입은 개발 환경에서만 실행하세요.
-- 프로덕션 환경에서는 이 섹션을 주석 처리하세요.

/*
-- 샘플 사용자
INSERT INTO users (user_id, email, password_hash, nickname, notification_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'chulsu@example.com', '$2b$10$abcd...', '김철수', true),
('550e8400-e29b-41d4-a716-446655440002', 'eunho@example.com', '$2b$10$efgh...', '김은호', true),
('550e8400-e29b-41d4-a716-446655440003', 'minjung@example.com', '$2b$10$ijkl...', '박민정', false);

-- 샘플 할일
INSERT INTO todos (todo_id, user_id, title, description, priority, status, due_date) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '프로젝트 보고서 작성', '월간 프로젝트 진행 상황 보고서', 'HIGH', 'ACTIVE', '2025-11-28'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '팀 회의 준비', '주간 팀 회의 안건 준비', 'NORMAL', 'ACTIVE', '2025-11-27'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '운동하기', '헬스장 방문', 'LOW', 'COMPLETED', NULL),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '알고리즘 과제', '자료구조 프로젝트', 'HIGH', 'ACTIVE', '2025-11-30'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '오래된 메모', '더 이상 필요 없음', 'LOW', 'DELETED', NULL);

-- 샘플 알림
INSERT INTO notifications (notification_id, user_id, todo_id, type, message, scheduled_at, is_sent) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'D_MINUS_1', '프로젝트 보고서 작성 마감 하루 전입니다.', '2025-11-27 09:00:00', false),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'D_DAY', '프로젝트 보고서 작성 마감일입니다!', '2025-11-28 09:00:00', false),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'D_MINUS_1', '팀 회의 준비 마감 하루 전입니다.', '2025-11-26 09:00:00', true),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'D_MINUS_1', '알고리즘 과제 마감 하루 전입니다.', '2025-11-29 09:00:00', false);

-- 샘플 캘린더 (2025년 11월-12월)
INSERT INTO calendars (date, is_holiday, holiday_name, year, month, week, day_of_week) VALUES
('2025-11-26', false, NULL, 2025, 11, 48, 'WEDNESDAY'),
('2025-11-27', false, NULL, 2025, 11, 48, 'THURSDAY'),
('2025-11-28', false, NULL, 2025, 11, 48, 'FRIDAY'),
('2025-12-25', true, '크리스마스', 2025, 12, 52, 'THURSDAY'),
('2026-01-01', true, '신정', 2026, 1, 1, 'THURSDAY');
*/

-- ========================================
-- 6. 검증 쿼리 (선택사항)
-- ========================================

-- 모든 테이블이 정상적으로 생성되었는지 확인
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- 모든 인덱스가 정상적으로 생성되었는지 확인
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- 모든 제약조건이 정상적으로 생성되었는지 확인
-- SELECT constraint_name, table_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_schema = 'public'
-- ORDER BY table_name, constraint_type;

-- ========================================
-- 스키마 생성 완료
-- ========================================
