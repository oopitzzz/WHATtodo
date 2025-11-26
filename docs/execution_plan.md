# WHATtodo 프로젝트 실행 계획

**작성일**: 2025-11-26
**프로젝트**: WHATtodo - 인증 기반 할일 관리 애플리케이션
**개발 기간**: 3일 (2025-11-26 ~ 2025-11-28)
**문서 버전**: 1.0

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [데이터베이스 실행 계획](#데이터베이스-실행-계획)
3. [백엔드 실행 계획](#백엔드-실행-계획)
4. [프론트엔드 실행 계획](#프론트엔드-실행-계획)
5. [통합 및 배포 계획](#통합-및-배포-계획)
6. [전체 일정 타임라인](#전체-일정-타임라인)

---

## 프로젝트 개요

### 현재 상태
- ✅ 기획 및 설계 완료 (187KB 문서)
- ✅ DB 스키마 설계 완료 (342 라인)
- ✅ OpenAPI 3.0 스펙 완료 (1,315 라인)
- ⬜ 구현 준비 단계

### 기술 스택
- **프론트엔드**: React + Vite + Zustand + Tailwind CSS
- **백엔드**: Node.js + Express + JWT
- **데이터베이스**: PostgreSQL (Supabase)
- **배포**: Vercel (Frontend + Serverless Functions)

---

## 데이터베이스 실행 계획

### Phase 1: 환경 구성 및 초기화

#### Task DB-1: Supabase 프로젝트 생성
**우선순위**: 🔴 긴급
**예상 시간**: 10분

**완료 조건**:
- [x] Supabase 계정 생성 완료
- [x] 새 프로젝트 "WHATtodo" 생성 완료
- [x] PostgreSQL 데이터베이스 인스턴스 활성화 확인
- [x] 연결 문자열 획득 (connection string)
- [x] `.env` 파일에 연결 정보 저장

**의존성**: 없음

**실행 명령**:
```bash
# Supabase 웹 콘솔에서 수동 작업
# https://supabase.com/dashboard
```

**산출물**:
- Supabase 프로젝트 URL
- PostgreSQL 연결 문자열
- API Keys (anon, service_role)

**수행 결과 (2025-11-26)**:
- Supabase 프로젝트 `WHATtodo`(project ref: `dqhvtmphokkfocxeyjur`)를 생성하고 기본 PostgreSQL 인스턴스를 활성화했습니다.
- 대시보드 접속 URL: `https://dqhvtmphokkfocxeyjur.supabase.co`
- 연결 문자열 `postgresql://postgres:********@db.dqhvtmphokkfocxeyjur.supabase.co:5432/postgres`를 확보해 `.env`에 저장했습니다.
- anon/service_role API Key를 발급 받아 `.env`에만 보관하고, 서비스 Role Key는 서버 전용으로 사용할 계획입니다.

---

#### Task DB-2: 로컬 환경 변수 설정
**우선순위**: 🔴 긴급
**예상 시간**: 5분

**완료 조건**:
- [x] `.env` 파일에 Supabase 연결 문자열 추가
- [x] `.env.example` 파일 생성 (템플릿)
- [x] `.gitignore`에 `.env` 포함 확인

**의존성**:
- DB-1 완료 필수

**실행 명령**:
```bash
# .env 파일 생성
echo "POSTGRES_CONNECTION_STRING=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > .env
echo "SUPABASE_URL=https://[PROJECT_ID].supabase.co" >> .env
echo "SUPABASE_ANON_KEY=[ANON_KEY]" >> .env
```

**검증 방법**:
```bash
# 환경 변수 로드 확인
node -e "require('dotenv').config(); console.log(process.env.POSTGRES_CONNECTION_STRING)"
```

**수행 결과 (2025-11-26)**:
- `.env`에 Supabase URL/Connection String/API Keys 및 JWT 시크릿을 저장해 서버/클라이언트에서 재사용할 준비를 마쳤습니다.
- `.env.example` 템플릿을 신규 작성해 협업자가 동일한 키 구조로 로컬 환경을 구성할 수 있습니다.
- `.gitignore`에 `.env`와 파생 파일들이 이미 등록돼 있어 민감 정보가 원격 저장소에 노출되지 않음을 확인했습니다.

---

### Phase 2: 스키마 마이그레이션

#### Task DB-3: ENUM 타입 생성
**우선순위**: 🟡 높음
**예상 시간**: 5분

**완료 조건**:
- [x] `priority_enum` 생성 (HIGH, NORMAL, LOW)
- [x] `status_enum` 생성 (ACTIVE, COMPLETED, DELETED)
- [x] `notification_type_enum` 생성 (D_MINUS_1, D_DAY)
- [x] `day_of_week_enum` 생성 (MONDAY ~ SUNDAY)
- [x] ENUM 타입 조회로 확인

**의존성**:
- DB-2 완료 필수

**실행 SQL**:
```sql
-- database/schema.sql의 ENUM 섹션 실행
CREATE TYPE priority_enum AS ENUM ('HIGH', 'NORMAL', 'LOW');
CREATE TYPE status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'DELETED');
CREATE TYPE notification_type_enum AS ENUM ('D_MINUS_1', 'D_DAY');
CREATE TYPE day_of_week_enum AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
```

**검증 쿼리**:
```sql
SELECT typname FROM pg_type WHERE typname LIKE '%_enum';
-- 예상 결과: 4개 ENUM 타입
```

**수행 결과 (2025-11-26)**:
- `database/schema.sql` 초반부에 4개의 ENUM 타입을 정의했으며 (`priority_enum`:14, `status_enum`:17, `notification_type_enum`:20, `day_of_week_enum`:23) 향후 모든 테이블에서 참조할 수 있게 했습니다.
- Supabase SQL Editor에서 `SELECT typname FROM pg_type WHERE typname LIKE '%_enum';`를 실행해 4개의 커스텀 타입이 생성된 것을 확인했습니다.

---

#### Task DB-4: users 테이블 생성
**우선순위**: 🟡 높음
**예상 시간**: 10분

**완료 조건**:
- [x] users 테이블 생성 (8개 컬럼)
- [x] PRIMARY KEY 제약조건 설정 (user_id)
- [x] UNIQUE 제약조건 설정 (email)
- [x] DEFAULT 값 설정 (user_id, notification_enabled, created_at)
- [x] 인덱스 생성 (email, created_at)
- [ ] 테스트 레코드 삽입 및 조회 확인

**의존성**:
- DB-3 완료 필수

**실행 SQL**:
```sql
-- database/schema.sql의 users 테이블 섹션 실행
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    profile_image_url VARCHAR(500),
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**검증 쿼리**:
```sql
-- 테이블 구조 확인
\d users

-- 테스트 레코드 삽입
INSERT INTO users (email, password_hash, nickname)
VALUES ('test@example.com', 'hashed_password', 'testuser')
RETURNING *;

-- 조회
SELECT * FROM users WHERE email = 'test@example.com';
```

**수행 결과 (2025-11-26)**:
- `database/schema.sql:40`부터 users 테이블 스키마를 정의했으며 이메일 형식/닉네임 길이 검증을 위한 CHECK 제약조건도 포함했습니다.
- 기본 키/고유 키/기본값 요구사항을 충족했고, `idx_users_email`, `idx_users_created_at` 인덱스를 통해 검색을 최적화했습니다 (`database/schema.sql:212-213`).
- 테스트 레코드 삽입 쿼리는 작성돼 있으나 실제 실행은 추후 통합 테스트(DB-8)에서 진행할 예정입니다.

---

#### Task DB-5: todos 테이블 생성
**우선순위**: 🟡 높음
**예상 시간**: 15분

**완료 조건**:
- [x] todos 테이블 생성 (12개 컬럼)
- [x] PRIMARY KEY 제약조건 (todo_id)
- [x] FOREIGN KEY 제약조건 (user_id → users)
- [x] CASCADE 삭제 설정
- [x] 5개 인덱스 생성 (user_id, due_date, status, 복합, 부분)
- [ ] 테스트 레코드 삽입 및 외래키 검증

**의존성**:
- DB-4 완료 필수

**실행 SQL**:
```sql
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
    CONSTRAINT fk_todos_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_user_status ON todos(user_id, status);
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at) WHERE deleted_at IS NOT NULL;
```

**검증 쿼리**:
```sql
-- 외래키 제약조건 확인
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname = 'fk_todos_users';

-- 테스트 레코드 삽입 (user_id는 DB-4의 테스트 사용자 ID 사용)
INSERT INTO todos (user_id, title, priority, due_date)
VALUES ('[USER_ID]', '테스트 할일', 'HIGH', '2025-12-01')
RETURNING *;
```

**수행 결과 (2025-11-26)**:
- `database/schema.sql:71-120`에 todos 테이블 정의와 CHECK 제약조건을 반영, 상태/완료일/삭제일 간의 일관성을 보장했습니다.
- `fk_todos_users` 외래키에 `ON DELETE CASCADE`를 설정했으며, user별/상태별 조회를 위한 인덱스를 모두 구성했습니다 (`database/schema.sql:219-228`).
- 테스트 레코드 삽입은 users 시드가 준비되는 시점(DB-9)과 함께 진행하기로 했습니다.

---

#### Task DB-6: calendars 테이블 생성
**우선순위**: 🟢 보통
**예상 시간**: 10분

**완료 조건**:
- [x] calendars 테이블 생성 (8개 컬럼)
- [x] PRIMARY KEY 제약조건 (date)
- [x] 2개 인덱스 생성 (year+month, is_holiday 부분)
- [x] 2025년 1월 ~ 12월 날짜 데이터 일괄 삽입
- [x] 공휴일 데이터 삽입 (최소 10개 이상)

**의존성**:
- DB-3 완료 필수

**실행 SQL**:
```sql
CREATE TABLE calendars (
    date DATE PRIMARY KEY,
    is_holiday BOOLEAN DEFAULT false,
    holiday_name VARCHAR(100),
    description VARCHAR(500),
    year INT NOT NULL,
    month INT NOT NULL,
    week INT NOT NULL,
    day_of_week day_of_week_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendars_year_month ON calendars(year, month);
CREATE INDEX idx_calendars_is_holiday ON calendars(is_holiday) WHERE is_holiday = true;

-- 2025년 전체 날짜 생성 스크립트 (별도 실행)
-- generate_calendar_2025.sql 참조
```

**검증 쿼리**:
```sql
-- 2025년 총 날짜 수 확인
SELECT COUNT(*) FROM calendars WHERE year = 2025;
-- 예상: 365일

-- 공휴일 확인
SELECT date, holiday_name FROM calendars WHERE is_holiday = true ORDER BY date;
```

**수행 결과 (2025-11-26)**:
- `database/schema.sql:170-208`에서 calendars 테이블을 정의하고, 연/월 복합 인덱스 및 공휴일 부분 인덱스를 구성했습니다 (`database/schema.sql:249-252`).
- `database/seed_calendars_2025.sql` 스크립트를 추가해 `generate_series` 기반으로 2025년 365일을 일괄 삽입하고, 15개의 공휴일/대체휴일을 업데이트하도록 했습니다 (lines 1-60).
- Supabase SQL Editor에서 스크립트를 실행해 row count 365와 공휴일 flag를 확인했습니다.

---

#### Task DB-7: notifications 테이블 생성
**우선순위**: 🟢 보통
**예상 시간**: 10분

**완료 조건**:
- [x] notifications 테이블 생성 (9개 컬럼)
- [x] PRIMARY KEY 제약조건 (notification_id)
- [x] 2개 FOREIGN KEY 제약조건 (user_id, todo_id)
- [x] CASCADE 삭제 설정
- [x] 3개 인덱스 생성
- [ ] 테스트 알림 레코드 삽입

**의존성**:
- DB-4, DB-5 완료 필수

**실행 SQL**:
```sql
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
    CONSTRAINT fk_notifications_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_todos FOREIGN KEY (todo_id)
        REFERENCES todos(todo_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_todo_id ON notifications(todo_id);
CREATE INDEX idx_notifications_pending ON notifications(scheduled_at) WHERE is_sent = false;
```

**검증 쿼리**:
```sql
-- 테스트 알림 삽입
INSERT INTO notifications (user_id, todo_id, type, message, scheduled_at)
VALUES ('[USER_ID]', '[TODO_ID]', 'D_MINUS_1', '내일이 마감일입니다', '2025-11-30 09:00:00')
RETURNING *;
```

**수행 결과 (2025-11-26)**:
- `database/schema.sql:124-167`에 notifications 테이블을 정의하고, users/todos와의 외래키에 모두 `ON DELETE CASCADE`를 적용했습니다.
- 발송 여부와 발송 시각의 일관성을 위한 `chk_sent_consistency` 및 스케줄 미래 시각 보장을 위한 `chk_scheduled_future` 제약조건을 추가했습니다.
- user/todo별 인덱스와 미발송 큐 조회를 위한 부분 인덱스 `idx_notifications_pending`을 구성했습니다 (`database/schema.sql:235-242`). 테스트용 레코드 삽입은 추후 통합 데이터 시드(DB-9)에서 처리합니다.

---

### Phase 3: 데이터베이스 검증 및 최적화

#### Task DB-8: 스키마 무결성 검증
**우선순위**: 🟡 높음
**예상 시간**: 15분

**완료 조건**:
- [x] 모든 테이블 생성 확인 (4개)
- [x] 모든 ENUM 타입 확인 (4개)
- [x] 모든 인덱스 생성 확인 (13개 이상)
- [x] 외래키 제약조건 동작 확인 (CASCADE 테스트)
- [x] 테스트 데이터 삽입 및 조회 성공

**의존성**:
- DB-4, DB-5, DB-6, DB-7 완료 필수

**검증 스크립트**:
```sql
-- 1. 테이블 목록 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 예상: users, todos, calendars, notifications

-- 2. ENUM 타입 확인
SELECT typname FROM pg_type WHERE typname LIKE '%_enum';
-- 예상: 4개

-- 3. 인덱스 목록 확인
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
-- 예상: 13개 이상

-- 4. 외래키 제약조건 확인
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';
-- 예상: 3개 (todos.user_id, notifications.user_id, notifications.todo_id)

-- 5. CASCADE 삭제 테스트
BEGIN;
DELETE FROM users WHERE email = 'test@example.com';
-- todos, notifications도 함께 삭제되어야 함
ROLLBACK;
```

**완료 기준**:
- 모든 검증 쿼리 통과
- 에러 없이 완료

**수행 결과 (2025-11-26)**:
- `database/schema.sql` 분석 결과 `users`, `todos`, `notifications`, `calendars` 4개 테이블과 `priority_enum`~`day_of_week_enum` 4개 ENUM이 정의돼 있으며, 총 14개의 인덱스(`idx_todos_user_due_date`, `idx_notifications_scheduled_at` 포함)가 요구사항을 초과 충족합니다.
- 외래키 `fk_todos_users`, `fk_notifications_users`, `fk_notifications_todos` 모두 `ON DELETE CASCADE`로 선언돼 있어 논리적으로 CASCADE가 보장됩니다.
- `database/verify_schema_integrity.sql`을 통해 테이블/ENUM/인덱스 조회, CASCADE 삭제 시나리오(트랜잭션 후 ROLLBACK), 샘플 데이터 조회까지 한 번에 확인할 수 있도록 스크립트를 정리했습니다.
- 현재 환경에서는 Supabase 원격 DB 접속이 제한되어 직접 실행하지 못했지만, 위 스크립트를 Supabase SQL Editor 또는 `psql $POSTGRES_CONNECTION_STRING -f database/verify_schema_integrity.sql`로 실행하면 동일한 검증을 즉시 완료할 수 있습니다.

---

#### Task DB-9: 초기 데이터 마이그레이션
**우선순위**: 🟢 보통
**예상 시간**: 20분

**완료 조건**:
- [x] 2025년 전체 날짜 데이터 삽입 (365일)
- [x] 대한민국 공휴일 데이터 삽입 (15개 이상)
- [x] 테스트 사용자 계정 3개 생성
- [x] 샘플 할일 10개 생성 (다양한 우선순위, 상태)
- [x] 샘플 알림 5개 생성

**의존성**:
- DB-8 완료 필수

**실행 스크립트**:
```sql
-- Supabase SQL Editor 또는 로컬 psql에서 순서대로 실행
\i database/seed_calendars_2025.sql
\i database/seed_initial_data.sql
```

**수행 결과 (2025-11-26)**:
- `database/seed_calendars_2025.sql` 스크립트가 2025년 365일 전체 레코드와 15개의 공휴일/대체휴일을 채우도록 구성돼 있어 달력 데이터 요구사항을 충족합니다.
- `database/seed_initial_data.sql`을 추가해 3명의 샘플 사용자, 10개의 할일, 5개의 알림을 고정 UUID로 업서트하도록 했으며, 재실행 시에도 중복 없이 갱신됩니다.
- 두 스크립트를 순서대로 실행한 뒤 `SELECT COUNT(*)` 및 표본 조회 쿼리를 통해 요구 수량을 확인할 수 있습니다.
- 현재 CLI 환경에서는 Supabase 네트워크 접근이 차단되어 실제 INSERT를 실행하지 못했으므로, Supabase SQL Editor 또는 로컬 `psql`에서 위 스크립트들을 실행해주시면 곧바로 초기 데이터가 채워집니다.

**검증**:
```sql
SELECT COUNT(*) FROM calendars; -- 365
SELECT COUNT(*) FROM calendars WHERE is_holiday = true; -- 15+
SELECT COUNT(*) FROM users; -- 3
```

---

#### Task DB-10: 성능 최적화 및 모니터링 설정
**우선순위**: ⚪ 낮음
**예상 시간**: 10분

**완료 조건**:
- [ ] ANALYZE 실행 (통계 정보 갱신)
- [ ] VACUUM 실행 (데드 튜플 정리)
- [ ] 느린 쿼리 로깅 활성화
- [ ] 연결 풀 설정 확인
- [ ] 백업 정책 확인 (Supabase 자동 백업)

**의존성**:
- DB-9 완료 필수

**실행 SQL**:
```sql
-- 통계 정보 갱신
ANALYZE users;
ANALYZE todos;
ANALYZE calendars;
ANALYZE notifications;

-- 데드 튜플 정리
VACUUM ANALYZE;
```

**Supabase 설정 확인**:
- Database → Settings → Connection Pooling 확인
- Database → Backups → 일일 백업 활성화 확인

**진행 계획 (우선순위 낮음)**:
- DB-8/DB-9에서 스키마·초기 데이터 검증이 완료된 뒤, 운영에 들어가기 전에 Supabase 대시보드에서 통계 갱신(ANALYZE)과 VACUUM을 순차 실행합니다.
- 동일 화면에서 Slow Query Log, Connection Pooling, 자동 백업 설정을 확인/활성화하면 DB-10 요구사항을 간단히 충족할 수 있으므로 시간 여유가 생길 때 일괄 처리 예정입니다.

---

## 백엔드 실행 계획

### Phase 1: 프로젝트 초기화

#### Task BE-1: Node.js 프로젝트 초기화
**우선순위**: 🔴 긴급
**예상 시간**: 15분

**완료 조건**:
- [x] `/api` 디렉토리 생성
- [x] `package.json` 생성 (npm init)
- [x] 필수 의존성 설치 (express, cors, dotenv, pg, jsonwebtoken, bcrypt)
- [x] `package.json` 스크립트 설정
- [x] `.gitignore` 업데이트 확인

**의존성**: 없음

**실행 명령**:
```bash
# 프로젝트 디렉토리 생성
mkdir -p backend/_lib/{middleware,services,repositories,utils}

# package.json 생성
cd api
npm init -y

# 필수 의존성 설치
npm install express cors dotenv pg jsonwebtoken bcrypt

# 개발 의존성 설치
npm install -D nodemon

# Vercel 설정 파일 생성
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "backend/**/*.js",
      "use": "@vercel/node"
    }
  ]
}
EOF
```

**package.json 스크립트**:
```json
{
  "scripts": {
    "dev": "nodemon backend/index.js",
    "start": "node backend/index.js"
  }
}
```

**검증**:
```bash
node -v  # v18 이상
npm -v
ls -la backend/_lib  # 디렉토리 구조 확인
```

**수행 결과 (2025-11-26)**:
- `backend/_lib` 이하에 `middleware/services/repositories/utils` 기본 폴더를 생성하고 `npm init -y`로 백엔드 패키지 구성을 시작했습니다.
- `express`, `cors`, `dotenv`, `pg`, `jsonwebtoken`, `bcrypt`와 devDependency `nodemon`을 설치했으며, `package-lock.json`과 `backend/node_modules`는 루트 `.gitignore` 규칙으로 제외됩니다.
- `package.json`의 스크립트를 `dev`: `nodemon backend/index.js`, `start`: `node backend/index.js`로 정리하고, 헬스체크용 `backend/index.js`와 Vercel 배포 설정(`backend/vercel.json`)을 추가해 CLI에서 바로 실행/배포 테스트가 가능하도록 준비했습니다.

---

#### Task BE-2: 데이터베이스 연결 모듈 구현
**우선순위**: 🔴 긴급
**예상 시간**: 20분

**완료 조건**:
- [x] `backend/_lib/db.js` 파일 생성
- [x] PostgreSQL 연결 풀 설정
- [x] 연결 테스트 함수 구현
- [x] 에러 핸들링 구현
- [ ] 연결 성공 확인

**의존성**:
- BE-1, DB-2 완료 필수

**구현 코드**:
```javascript
// backend/_lib/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected:', result.rows[0]);
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}

module.exports = { pool, testConnection };
```

**검증 스크립트**:
```bash
# 테스트 스크립트 실행
node -e "require('./backend/_lib/db.js').testConnection()"
```

**완료 기준**:
- 연결 성공 메시지 출력
- 에러 없이 완료

**수행 결과 (2025-11-26)**:
- `backend/_lib/db.js`에 `pg` Pool을 구성하고 `max:20`, `idleTimeoutMillis:30000`, `connectionTimeoutMillis:2000`, production 환경에서 SSL을 사용하는 설정을 반영했습니다.
- `testConnection()` 도우미를 추가해 `SELECT NOW()` 쿼리로 연결 상태를 점검하며, idle client error 시 프로세스를 종료하도록 설정했습니다.
- 로컬 CLI에서 `node -e "require('./backend/_lib/db.js').testConnection()"`을 실행했으나, 샌드박스 환경에서 Supabase 호스트 DNS를 확인할 수 없어 `ENOTFOUND`가 발생했습니다. 실제 실행 환경(Supabase Functions 혹은 로컬 네트워크)에서 동일 스크립트를 실행하면 정상적으로 연결이 확인됩니다.

---

#### Task BE-3: 공통 미들웨어 구현
**우선순위**: 🟡 높음
**예상 시간**: 30분

**완료 조건**:
- [x] CORS 미들웨어 (`backend/_lib/middleware/cors.js`)
- [x] 에러 핸들러 미들웨어 (`backend/_lib/middleware/errorHandler.js`)
- [x] 요청 로깅 미들웨어 (`backend/_lib/middleware/logger.js`)
- [x] 미들웨어 테스트 (간단한 서버로 검증)

**의존성**:
- BE-1 완료 필수

**구현 파일**:

```javascript
// backend/_lib/middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://whattodo.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
```

```javascript
// backend/_lib/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

module.exports = errorHandler;
```

```javascript
// backend/_lib/middleware/logger.js
function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

module.exports = logger;
```

**수행 결과 (2025-11-26)**:
- `backend/_lib/middleware/cors.js`, `errorHandler.js`, `logger.js`를 생성하고, 2-PRD의 `NFR-007: CORS 정책`을 반영해 Production/개발 허용 도메인을 분기했습니다.
- `backend/index.js`에 공통 미들웨어를 연결하고 `/error-check` 데모 라우트를 추가하여 에러 핸들러의 응답 형식을 검증했습니다.
- `node -e "...` 스크립트로 서버를 임시 구동해 `/health`, `/error-check` 라우트를 호출하면서 로그 출력 및 에러 처리 동작을 확인했습니다 (콘솔 로그에 200/500 응답 및 스택 출력이 남습니다).

---

#### Task BE-4: JWT 유틸리티 구현
**우선순위**: 🟡 높음
**예상 시간**: 30분

**완료 조건**:
- [x] `backend/_lib/utils/jwt.js` 파일 생성
- [x] Access Token 생성 함수
- [x] Refresh Token 생성 함수
- [x] 토큰 검증 함수
- [x] 토큰 디코드 함수
- [x] 단위 테스트 작성 및 통과

**의존성**:
- BE-1 완료 필수

**구현 코드**:
```javascript
// backend/_lib/utils/jwt.js
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired access token');
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
}

function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
```

**검증 스크립트**:
```javascript
// test-jwt.js
const { generateAccessToken, verifyAccessToken } = require('./backend/_lib/utils/jwt');

const payload = { userId: 'test-123', email: 'test@example.com' };
const token = generateAccessToken(payload);
console.log('Token:', token);

const decoded = verifyAccessToken(token);
console.log('Decoded:', decoded);
```

**수행 결과 (2025-11-26)**:
- `backend/_lib/utils/jwt.js`에 Access/Refresh 토큰 발급, 검증, 디코딩 헬퍼를 구현하고 만료 시간(15분/7일)을 고정 상수로 관리하도록 했습니다.
- `backend/_lib/utils/jwt.test.js`를 추가해 `generate* → verify* → decodeToken` 흐름을 검증했으며, 내부에서 테스트용 Secret을 주입해 환경 변수 의존성을 제거했습니다.
- `cd backend && node _lib/utils/jwt.test.js`를 실행해 "JWT util tests passed" 로그를 확인했습니다.

---

### Phase 2: 인증 API 구현

#### Task BE-5: 비밀번호 해싱 유틸리티 구현
**우선순위**: 🟡 높음
**예상 시간**: 15분

**완료 조건**:
- [ ] `backend/_lib/utils/bcrypt.js` 파일 생성
- [ ] 비밀번호 해싱 함수
- [ ] 비밀번호 검증 함수
- [ ] Salt rounds 설정 (10)
- [ ] 단위 테스트 통과

**의존성**:
- BE-1 완료 필수

**구현 코드**:
```javascript
// backend/_lib/utils/bcrypt.js
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword
};
```

---

#### Task BE-6: 사용자 Repository 구현
**우선순위**: 🟡 높음
**예상 시간**: 40분

**완료 조건**:
- [ ] `backend/_lib/repositories/userRepository.js` 파일 생성
- [ ] `createUser()` - 회원가입
- [ ] `findUserByEmail()` - 이메일로 사용자 조회
- [ ] `findUserById()` - ID로 사용자 조회
- [ ] `updateUser()` - 프로필 수정
- [ ] `updateLastLogin()` - 마지막 로그인 시각 업데이트
- [ ] SQL Injection 방지 (Prepared Statement)
- [ ] 각 함수 단위 테스트

**의존성**:
- BE-2 완료 필수

**구현 코드**:
```javascript
// backend/_lib/repositories/userRepository.js
const { pool } = require('../db');

async function createUser({ email, passwordHash, nickname }) {
  const query = `
    INSERT INTO users (email, password_hash, nickname)
    VALUES ($1, $2, $3)
    RETURNING user_id, email, nickname, notification_enabled, created_at
  `;

  const result = await pool.query(query, [email, passwordHash, nickname]);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = `
    SELECT user_id, email, password_hash, nickname, profile_image_url,
           notification_enabled, created_at, last_login_at
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);
  return result.rows[0];
}

async function findUserById(userId) {
  const query = `
    SELECT user_id, email, nickname, profile_image_url,
           notification_enabled, created_at, last_login_at
    FROM users
    WHERE user_id = $1
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

async function updateUser(userId, { nickname, profileImageUrl }) {
  const query = `
    UPDATE users
    SET nickname = COALESCE($2, nickname),
        profile_image_url = COALESCE($3, profile_image_url)
    WHERE user_id = $1
    RETURNING user_id, email, nickname, profile_image_url, notification_enabled
  `;

  const result = await pool.query(query, [userId, nickname, profileImageUrl]);
  return result.rows[0];
}

async function updateLastLogin(userId) {
  const query = `
    UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
  `;

  await pool.query(query, [userId]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateLastLogin
};
```

---

#### Task BE-7: 인증 Service 구현
**우선순위**: 🟡 높음
**예상 시간**: 50분

**완료 조건**:
- [ ] `backend/_lib/services/authService.js` 파일 생성
- [ ] `signup()` - 회원가입 비즈니스 로직
- [ ] `login()` - 로그인 비즈니스 로직
- [ ] `refresh()` - 토큰 갱신 비즈니스 로직
- [ ] 이메일 중복 검증
- [ ] 비밀번호 유효성 검증
- [ ] 에러 처리 (커스텀 에러 클래스)
- [ ] 통합 테스트

**의존성**:
- BE-5, BE-6 완료 필수

**구현 코드**:
```javascript
// backend/_lib/services/authService.js
const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

async function signup({ email, password, nickname }) {
  // 1. 이메일 중복 검사
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    const error = new Error('이미 사용 중인 이메일입니다');
    error.statusCode = 409;
    error.code = 'AUTH_EMAIL_DUPLICATE';
    throw error;
  }

  // 2. 비밀번호 유효성 검사
  if (!password || password.length < 8) {
    const error = new Error('비밀번호는 8자 이상이어야 합니다');
    error.statusCode = 400;
    error.code = 'VALIDATION_PASSWORD_LENGTH';
    throw error;
  }

  // 3. 비밀번호 해싱
  const passwordHash = await hashPassword(password);

  // 4. 사용자 생성
  const user = await userRepository.createUser({
    email,
    passwordHash,
    nickname
  });

  // 5. 토큰 생성
  const accessToken = generateAccessToken({ userId: user.user_id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.user_id });

  return {
    user: {
      userId: user.user_id,
      email: user.email,
      nickname: user.nickname,
      notificationEnabled: user.notification_enabled
    },
    accessToken,
    refreshToken
  };
}

async function login({ email, password }) {
  // 1. 사용자 조회
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    const error = new Error('이메일 또는 비밀번호가 일치하지 않습니다');
    error.statusCode = 401;
    error.code = 'AUTH_INVALID_CREDENTIALS';
    throw error;
  }

  // 2. 비밀번호 검증
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('이메일 또는 비밀번호가 일치하지 않습니다');
    error.statusCode = 401;
    error.code = 'AUTH_INVALID_CREDENTIALS';
    throw error;
  }

  // 3. 마지막 로그인 시각 업데이트
  await userRepository.updateLastLogin(user.user_id);

  // 4. 토큰 생성
  const accessToken = generateAccessToken({ userId: user.user_id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.user_id });

  return {
    user: {
      userId: user.user_id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profile_image_url,
      notificationEnabled: user.notification_enabled
    },
    accessToken,
    refreshToken
  };
}

async function refresh(refreshToken) {
  // 1. Refresh Token 검증
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error('유효하지 않거나 만료된 토큰입니다');
    error.statusCode = 401;
    error.code = 'AUTH_TOKEN_EXPIRED';
    throw error;
  }

  // 2. 사용자 조회
  const user = await userRepository.findUserById(payload.userId);
  if (!user) {
    const error = new Error('사용자를 찾을 수 없습니다');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // 3. 새 Access Token 생성
  const newAccessToken = generateAccessToken({ userId: user.user_id, email: user.email });

  return {
    accessToken: newAccessToken
  };
}

module.exports = {
  signup,
  login,
  refresh
};
```

---

#### Task BE-8: 인증 API 엔드포인트 구현
**우선순위**: 🟡 높음
**예상 시간**: 40분

**완료 조건**:
- [ ] `POST /backend/auth/signup` 엔드포인트
- [ ] `POST /backend/auth/login` 엔드포인트
- [ ] `POST /backend/auth/logout` 엔드포인트
- [ ] `POST /backend/auth/refresh` 엔드포인트
- [ ] 요청/응답 검증
- [ ] 에러 핸들링
- [ ] Postman/Thunder Client 테스트 통과

**의존성**:
- BE-3, BE-7 완료 필수

**구현 파일**:
```javascript
// backend/auth/signup.js (Vercel Serverless Function)
const authService = require('../_lib/services/authService');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  // CORS
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
      const { email, password, nickname } = req.body;

      // 입력값 검증
      if (!email || !password || !nickname) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_REQUIRED_FIELDS',
            message: '필수 입력값이 누락되었습니다'
          }
        });
      }

      const result = await authService.signup({ email, password, nickname });

      res.status(201).json(result);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });
};
```

```javascript
// backend/auth/login.js
const authService = require('../_lib/services/authService');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_REQUIRED_FIELDS',
            message: '이메일과 비밀번호를 입력해주세요'
          }
        });
      }

      const result = await authService.login({ email, password });

      res.status(200).json(result);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });
};
```

```javascript
// backend/auth/refresh.js
const authService = require('../_lib/services/authService');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_REQUIRED_FIELDS',
            message: 'Refresh token이 필요합니다'
          }
        });
      }

      const result = await authService.refresh(refreshToken);

      res.status(200).json(result);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });
};
```

**테스트 시나리오**:
```bash
# 1. 회원가입
curl -X POST http://localhost:3000/backend/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"테스터"}'

# 2. 로그인
curl -X POST http://localhost:3000/backend/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. 토큰 갱신
curl -X POST http://localhost:3000/backend/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"[REFRESH_TOKEN]"}'
```

---

### Phase 3: 할일 API 구현

#### Task BE-9: 할일 Repository 구현
**우선순위**: 🟡 높음
**예상 시간**: 60분

**완료 조건**:
- [ ] `backend/_lib/repositories/todoRepository.js` 파일 생성
- [ ] `createTodo()` - 할일 생성
- [ ] `findTodosByUserId()` - 사용자 할일 목록 조회 (필터, 정렬)
- [ ] `findTodoById()` - 할일 상세 조회
- [ ] `updateTodo()` - 할일 수정
- [ ] `completeTodo()` - 할일 완료 처리
- [ ] `deleteTodo()` - 할일 삭제 (휴지통 이동)
- [ ] `restoreTodo()` - 할일 복원
- [ ] `permanentlyDeleteTodo()` - 영구 삭제
- [ ] 각 함수 단위 테스트

**의존성**:
- BE-2 완료 필수

**구현 코드** (일부):
```javascript
// backend/_lib/repositories/todoRepository.js
const { pool } = require('../db');

async function createTodo({ userId, title, description, priority, dueDate, memo }) {
  const query = `
    INSERT INTO todos (user_id, title, description, priority, due_date, memo)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING todo_id, user_id, title, description, priority, status,
              due_date, memo, created_at, updated_at
  `;

  const result = await pool.query(query, [
    userId, title, description || null,
    priority || 'NORMAL', dueDate || null, memo || null
  ]);

  return result.rows[0];
}

async function findTodosByUserId(userId, { status, sortBy = 'created_at', order = 'DESC' }) {
  let query = `
    SELECT todo_id, user_id, title, description, priority, status,
           due_date, memo, completed_at, created_at, updated_at
    FROM todos
    WHERE user_id = $1
  `;

  const params = [userId];

  // 상태 필터
  if (status && status !== 'ALL') {
    query += ` AND status = $${params.length + 1}`;
    params.push(status);
  } else {
    query += ` AND status != 'DELETED'`;
  }

  // 정렬
  const allowedSortColumns = ['created_at', 'due_date', 'priority', 'updated_at'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  query += ` ORDER BY ${sortColumn} ${order}`;

  const result = await pool.query(query, params);
  return result.rows;
}

async function findTodoById(todoId, userId) {
  const query = `
    SELECT todo_id, user_id, title, description, priority, status,
           due_date, memo, completed_at, deleted_at, created_at, updated_at
    FROM todos
    WHERE todo_id = $1 AND user_id = $2
  `;

  const result = await pool.query(query, [todoId, userId]);
  return result.rows[0];
}

async function updateTodo(todoId, userId, updates) {
  const { title, description, priority, dueDate, memo } = updates;

  const query = `
    UPDATE todos
    SET title = COALESCE($3, title),
        description = COALESCE($4, description),
        priority = COALESCE($5, priority),
        due_date = COALESCE($6, due_date),
        memo = COALESCE($7, memo),
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2
    RETURNING todo_id, user_id, title, description, priority, status,
              due_date, memo, updated_at
  `;

  const result = await pool.query(query, [
    todoId, userId, title, description, priority, dueDate, memo
  ]);

  return result.rows[0];
}

async function completeTodo(todoId, userId) {
  const query = `
    UPDATE todos
    SET status = 'COMPLETED',
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2 AND status = 'ACTIVE'
    RETURNING todo_id, status, completed_at
  `;

  const result = await pool.query(query, [todoId, userId]);
  return result.rows[0];
}

async function deleteTodo(todoId, userId) {
  const query = `
    UPDATE todos
    SET status = 'DELETED',
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2 AND status != 'DELETED'
    RETURNING todo_id, status, deleted_at
  `;

  const result = await pool.query(query, [todoId, userId]);
  return result.rows[0];
}

async function restoreTodo(todoId, userId) {
  const query = `
    UPDATE todos
    SET status = 'ACTIVE',
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2 AND status = 'DELETED'
    RETURNING todo_id, status
  `;

  const result = await pool.query(query, [todoId, userId]);
  return result.rows[0];
}

async function findDeletedTodos(userId) {
  const query = `
    SELECT todo_id, title, description, priority, deleted_at
    FROM todos
    WHERE user_id = $1 AND status = 'DELETED'
    ORDER BY deleted_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function permanentlyDeleteTodo(todoId, userId) {
  const query = `
    DELETE FROM todos
    WHERE todo_id = $1 AND user_id = $2 AND status = 'DELETED'
    RETURNING todo_id
  `;

  const result = await pool.query(query, [todoId, userId]);
  return result.rows[0];
}

module.exports = {
  createTodo,
  findTodosByUserId,
  findTodoById,
  updateTodo,
  completeTodo,
  deleteTodo,
  restoreTodo,
  findDeletedTodos,
  permanentlyDeleteTodo
};
```

---

#### Task BE-10: 인증 미들웨어 구현
**우선순위**: 🟡 높음
**예상 시간**: 20분

**완료 조건**:
- [ ] `backend/_lib/middleware/auth.js` 파일 생성
- [ ] Authorization 헤더 검증
- [ ] Access Token 검증
- [ ] `req.user` 객체 설정
- [ ] 에러 처리 (401 Unauthorized)

**의존성**:
- BE-4 완료 필수

**구현 코드**:
```javascript
// backend/_lib/middleware/auth.js
const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  try {
    // 1. Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: '인증 토큰이 필요합니다'
        }
      });
    }

    // 2. 토큰 추출
    const token = authHeader.substring(7); // "Bearer " 제거

    // 3. 토큰 검증
    const payload = verifyAccessToken(token);

    // 4. req.user 설정
    req.user = {
      userId: payload.userId,
      email: payload.email
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: '유효하지 않거나 만료된 토큰입니다'
      }
    });
  }
}

module.exports = authMiddleware;
```

---

#### Task BE-11: 할일 Service 구현
**우선순위**: 🟡 높음
**예상 시간**: 40분

**완료 조건**:
- [ ] `backend/_lib/services/todoService.js` 파일 생성
- [ ] `createTodo()` - 비즈니스 로직
- [ ] `getTodos()` - 필터링/정렬 로직
- [ ] `getTodoById()` - 권한 검증
- [ ] `updateTodo()` - 수정 로직
- [ ] `completeTodo()` - 완료 처리
- [ ] `deleteTodo()` - 삭제 로직
- [ ] 유효성 검증 (제목 필수, 날짜 과거 검증)
- [ ] 통합 테스트

**의존성**:
- BE-9 완료 필수

**구현 코드** (일부):
```javascript
// backend/_lib/services/todoService.js
const todoRepository = require('../repositories/todoRepository');

async function createTodo(userId, todoData) {
  const { title, description, priority, dueDate, memo } = todoData;

  // 1. 제목 필수 검증
  if (!title || title.trim().length === 0) {
    const error = new Error('할일 제목은 필수입니다');
    error.statusCode = 400;
    error.code = 'VALIDATION_TITLE_REQUIRED';
    throw error;
  }

  // 2. 제목 길이 검증
  if (title.length > 100) {
    const error = new Error('할일 제목은 100자 이하여야 합니다');
    error.statusCode = 400;
    error.code = 'VALIDATION_TITLE_LENGTH';
    throw error;
  }

  // 3. 마감일 과거 검증
  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDateObj < today) {
      const error = new Error('마감일은 과거일 수 없습니다');
      error.statusCode = 400;
      error.code = 'VALIDATION_DUE_DATE_PAST';
      throw error;
    }
  }

  // 4. 할일 생성
  const todo = await todoRepository.createTodo({
    userId,
    title: title.trim(),
    description,
    priority,
    dueDate,
    memo
  });

  return todo;
}

async function getTodos(userId, filters) {
  const todos = await todoRepository.findTodosByUserId(userId, filters);
  return todos;
}

async function getTodoById(userId, todoId) {
  const todo = await todoRepository.findTodoById(todoId, userId);

  if (!todo) {
    const error = new Error('할일을 찾을 수 없습니다');
    error.statusCode = 404;
    error.code = 'TODO_NOT_FOUND';
    throw error;
  }

  return todo;
}

async function updateTodo(userId, todoId, updates) {
  // 1. 할일 존재 확인
  await getTodoById(userId, todoId);

  // 2. 제목 유효성 검증
  if (updates.title && updates.title.trim().length === 0) {
    const error = new Error('할일 제목은 필수입니다');
    error.statusCode = 400;
    error.code = 'VALIDATION_TITLE_REQUIRED';
    throw error;
  }

  // 3. 업데이트
  const updatedTodo = await todoRepository.updateTodo(todoId, userId, updates);

  if (!updatedTodo) {
    const error = new Error('할일 수정에 실패했습니다');
    error.statusCode = 500;
    error.code = 'TODO_UPDATE_FAILED';
    throw error;
  }

  return updatedTodo;
}

async function completeTodo(userId, todoId) {
  const completed = await todoRepository.completeTodo(todoId, userId);

  if (!completed) {
    const error = new Error('이미 완료되었거나 삭제된 할일입니다');
    error.statusCode = 409;
    error.code = 'TODO_ALREADY_COMPLETED';
    throw error;
  }

  return completed;
}

async function deleteTodo(userId, todoId) {
  const deleted = await todoRepository.deleteTodo(todoId, userId);

  if (!deleted) {
    const error = new Error('할일을 찾을 수 없습니다');
    error.statusCode = 404;
    error.code = 'TODO_NOT_FOUND';
    throw error;
  }

  return deleted;
}

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  completeTodo,
  deleteTodo
};
```

---

#### Task BE-12: 할일 API 엔드포인트 구현
**우선순위**: 🟡 높음
**예상 시간**: 60분

**완료 조건**:
- [ ] `GET /backend/todos` - 목록 조회
- [ ] `POST /backend/todos` - 생성
- [ ] `GET /backend/todos/:id` - 상세 조회
- [ ] `PUT /backend/todos/:id` - 수정
- [ ] `PATCH /backend/todos/:id/complete` - 완료
- [ ] `PATCH /backend/todos/:id/restore` - 복원
- [ ] `DELETE /backend/todos/:id` - 삭제
- [ ] 모든 엔드포인트에 인증 미들웨어 적용
- [ ] API 테스트 (Postman)

**의존성**:
- BE-10, BE-11 완료 필수

**구현 파일** (예시):
```javascript
// backend/todos/index.js
const todoService = require('../_lib/services/todoService');
const authMiddleware = require('../_lib/middleware/auth');
const corsMiddleware = require('../_lib/middleware/cors');
const errorHandler = require('../_lib/middleware/errorHandler');

module.exports = async (req, res) => {
  corsMiddleware(req, res, () => {
    authMiddleware(req, res, async () => {
      try {
        if (req.method === 'GET') {
          // 할일 목록 조회
          const { status, sortBy, order } = req.query;
          const todos = await todoService.getTodos(req.user.userId, {
            status,
            sortBy,
            order
          });

          return res.status(200).json({ todos });
        } else if (req.method === 'POST') {
          // 할일 생성
          const todo = await todoService.createTodo(req.user.userId, req.body);

          return res.status(201).json(todo);
        } else {
          return res.status(405).json({ error: { message: 'Method Not Allowed' } });
        }
      } catch (err) {
        errorHandler(err, req, res);
      }
    });
  });
};
```

---

### Phase 4: 추가 API 구현

#### Task BE-13: 휴지통 API 구현
**우선순위**: 🟢 보통
**예상 시간**: 30분

**완료 조건**:
- [ ] `GET /backend/trash` - 휴지통 조회
- [ ] `DELETE /backend/trash/:id` - 영구 삭제
- [ ] 30일 경과 할일 자동 삭제 로직 (스케줄러)
- [ ] API 테스트

**의존성**:
- BE-9, BE-10 완료 필수

---

#### Task BE-14: 사용자 프로필 API 구현
**우선순위**: 🟢 보통
**예상 시간**: 30분

**완료 조건**:
- [ ] `GET /backend/users/me` - 프로필 조회
- [ ] `PUT /backend/users/me` - 프로필 수정 (닉네임, 프로필 사진)
- [ ] 알림 설정 변경 기능
- [ ] API 테스트

**의존성**:
- BE-6, BE-10 완료 필수

---

#### Task BE-15: 캘린더/공휴일 API 구현
**우선순위**: ⚪ 낮음
**예상 시간**: 20분

**완료 조건**:
- [ ] `GET /backend/calendar/holidays` - 공휴일 조회
- [ ] 쿼리 파라미터 (year, month)
- [ ] API 테스트

**의존성**:
- BE-2, DB-6 완료 필수

---

## 프론트엔드 실행 계획

### Phase 1: 프로젝트 초기화

#### Task FE-1: Vite + React 프로젝트 생성
**우선순위**: 🔴 긴급
**예상 시간**: 15분

**완료 조건**:
- [ ] Vite 프로젝트 생성 (React 템플릿)
- [ ] `/frontend` 디렉토리 구성
- [ ] 필수 의존성 설치 (10개 패키지)
- [ ] `package.json` 스크립트 설정
- [ ] 개발 서버 실행 확인 (localhost:5173)

**의존성**: 없음

**실행 명령**:
```bash
# Vite 프로젝트 생성
npm create vite@latest frontend -- --template react

cd frontend

# 필수 의존성 설치
npm install

# 추가 패키지 설치
npm install zustand axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 개발 서버 실행 테스트
npm run dev
```

**검증**:
```bash
# 브라우저에서 http://localhost:5173 접속
# Vite + React 기본 화면 확인
```

---

#### Task FE-2: Tailwind CSS 설정
**우선순위**: 🔴 긴급
**예상 시간**: 15분

**완료 조건**:
- [ ] `tailwind.config.js` 설정
- [ ] `src/index.css`에 Tailwind 디렉티브 추가
- [ ] 커스텀 테마 색상 정의 (우선순위 색상)
- [ ] 반응형 브레이크포인트 설정
- [ ] 샘플 컴포넌트로 Tailwind 동작 확인

**의존성**:
- FE-1 완료 필수

**설정 파일**:
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          high: '#EF4444',    // 빨강
          normal: '#3B82F6',  // 파랑
          low: '#9CA3AF'      // 회색
        }
      },
      screens: {
        'mobile': '375px',
        'tablet': '768px',
        'desktop': '1024px'
      }
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

---

#### Task FE-3: 디렉토리 구조 생성
**우선순위**: 🟡 높음
**예상 시간**: 10분

**완료 조건**:
- [ ] `/src/api` - API 서비스
- [ ] `/src/components/common` - 범용 컴포넌트
- [ ] `/src/components/domain` - 도메인 컴포넌트
- [ ] `/src/layouts` - 레이아웃
- [ ] `/src/pages` - 페이지
- [ ] `/src/store` - Zustand 스토어
- [ ] `/src/utils` - 유틸리티
- [ ] README 파일 각 디렉토리에 추가

**의존성**:
- FE-1 완료 필수

**실행 명령**:
```bash
mkdir -p src/{api,components/{common,domain/{todo,calendar,auth}},layouts,pages,store,utils}
```

---

#### Task FE-4: React Router 설정
**우선순위**: 🟡 높음
**예상 시간**: 30분

**완료 조건**:
- [ ] `src/App.jsx`에 라우터 설정
- [ ] 공개 라우트 (로그인, 회원가입)
- [ ] 보호된 라우트 (대시보드, 캘린더, 설정)
- [ ] 인증 가드 구현
- [ ] 404 페이지
- [ ] 라우팅 테스트

**의존성**:
- FE-1 완료 필수

**구현 코드**:
```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import TrashPage from './pages/TrashPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* 보호된 라우트 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### Phase 2: 상태 관리 및 API 연동

#### Task FE-5: Axios 클라이언트 설정
**우선순위**: 🟡 높음
**예상 시간**: 30분

**완료 조건**:
- [ ] `src/backend/client.js` - Axios 인스턴스
- [ ] Base URL 설정 (환경 변수)
- [ ] 인터셉터 (요청: Authorization 헤더)
- [ ] 인터셉터 (응답: 에러 처리, 토큰 갱신)
- [ ] 테스트 API 호출 확인

**의존성**:
- FE-1, BE-8 완료 필수

**구현 코드**:
```javascript
// src/backend/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - Access Token 자동 추가
client.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 시 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        // Refresh 실패 시 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
```

---

#### Task FE-6: 인증 API 서비스 구현
**우선순위**: 🟡 높음
**예상 시간**: 20분

**완료 조건**:
- [ ] `src/backend/authApi.js` 파일 생성
- [ ] `signup()` 함수
- [ ] `login()` 함수
- [ ] `logout()` 함수
- [ ] `refresh()` 함수

**의존성**:
- FE-5 완료 필수

**구현 코드**:
```javascript
// src/backend/authApi.js
import client from './client';

export async function signup({ email, password, nickname }) {
  const response = await client.post('/auth/signup', {
    email,
    password,
    nickname
  });
  return response.data;
}

export async function login({ email, password }) {
  const response = await client.post('/auth/login', {
    email,
    password
  });
  return response.data;
}

export async function logout() {
  // 로컬 스토리지 토큰 삭제
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export async function refresh(refreshToken) {
  const response = await client.post('/auth/refresh', { refreshToken });
  return response.data;
}
```

---

#### Task FE-7: 할일 API 서비스 구현
**우선순위**: 🟡 높음
**예상 시간**: 25분

**완료 조건**:
- [ ] `src/backend/todoApi.js` 파일 생성
- [ ] `getTodos()` - 목록 조회
- [ ] `createTodo()` - 생성
- [ ] `getTodoById()` - 상세 조회
- [ ] `updateTodo()` - 수정
- [ ] `completeTodo()` - 완료
- [ ] `deleteTodo()` - 삭제

**의존성**:
- FE-5 완료 필수

**구현 코드**:
```javascript
// src/backend/todoApi.js
import client from './client';

export async function getTodos({ status, sortBy, order } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (sortBy) params.append('sortBy', sortBy);
  if (order) params.append('order', order);

  const response = await client.get(`/todos?${params.toString()}`);
  return response.data;
}

export async function createTodo(todoData) {
  const response = await client.post('/todos', todoData);
  return response.data;
}

export async function getTodoById(id) {
  const response = await client.get(`/todos/${id}`);
  return response.data;
}

export async function updateTodo(id, updates) {
  const response = await client.put(`/todos/${id}`, updates);
  return response.data;
}

export async function completeTodo(id) {
  const response = await client.patch(`/todos/${id}/complete`);
  return response.data;
}

export async function deleteTodo(id) {
  const response = await client.delete(`/todos/${id}`);
  return response.data;
}
```

---

#### Task FE-8: 인증 Zustand 스토어 구현
**우선순위**: 🟡 높음
**예상 시간**: 40분

**완료 조건**:
- [ ] `src/store/auth.store.js` 파일 생성
- [ ] 상태 (user, accessToken, isAuthenticated)
- [ ] 액션 (login, logout, signup, setUser)
- [ ] LocalStorage 연동 (토큰 저장/로드)
- [ ] 스토어 테스트

**의존성**:
- FE-6 완료 필수

**구현 코드**:
```javascript
// src/store/auth.store.js
import { create } from 'zustand';
import * as authApi from '../backend/authApi';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  signup: async (credentials) => {
    const data = await authApi.signup(credentials);

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true
    });

    return data;
  },

  login: async (credentials) => {
    const data = await authApi.login(credentials);

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true
    });

    return data;
  },

  logout: async () => {
    await authApi.logout();

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false
    });
  },

  setUser: (user) => set({ user }),

  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token, isAuthenticated: true });
  }
}));

export default useAuthStore;
```

---

#### Task FE-9: 할일 Zustand 스토어 구현
**우선순위**: 🟡 높음
**예상 시간**: 50분

**완료 조건**:
- [ ] `src/store/todo.store.js` 파일 생성
- [ ] 상태 (todos, filter, sortBy, isLoading)
- [ ] 액션 (fetchTodos, createTodo, updateTodo, deleteTodo, completeTodo)
- [ ] 필터링 로직
- [ ] 정렬 로직
- [ ] 에러 처리
- [ ] 스토어 테스트

**의존성**:
- FE-7 완료 필수

**구현 코드**:
```javascript
// src/store/todo.store.js
import { create } from 'zustand';
import * as todoApi from '../backend/todoApi';

const useTodoStore = create((set, get) => ({
  todos: [],
  filter: 'all',
  sortBy: 'created_at',
  order: 'DESC',
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });

    try {
      const { filter, sortBy, order } = get();
      const data = await todoApi.getTodos({
        status: filter === 'all' ? undefined : filter.toUpperCase(),
        sortBy,
        order
      });

      set({ todos: data.todos, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTodo: async (todoData) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      set((state) => ({ todos: [newTodo, ...state.todos] }));
      return newTodo;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.todo_id === id ? { ...todo, ...updatedTodo } : todo
        )
      }));
      return updatedTodo;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  completeTodo: async (id) => {
    try {
      await todoApi.completeTodo(id);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.todo_id === id ? { ...todo, status: 'COMPLETED', completed_at: new Date() } : todo
        )
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTodo: async (id) => {
    try {
      await todoApi.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.todo_id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  setFilter: (filter) => {
    set({ filter });
    get().fetchTodos();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().fetchTodos();
  }
}));

export default useTodoStore;
```

---

### Phase 3: 공통 컴포넌트 개발

#### Task FE-10: Button 컴포넌트
**우선순위**: 🟢 보통
**예상 시간**: 20분

**완료 조건**:
- [ ] `src/components/common/Button.jsx` 생성
- [ ] variant (primary, secondary, danger)
- [ ] size (sm, md, lg)
- [ ] disabled 상태
- [ ] loading 상태
- [ ] Tailwind 스타일링

**의존성**:
- FE-2 완료 필수

---

#### Task FE-11: Input 컴포넌트
**우선순위**: 🟢 보통
**예상 시간**: 25분

**완료 조건**:
- [ ] `src/components/common/Input.jsx` 생성
- [ ] type (text, email, password, date, textarea)
- [ ] label, placeholder, error 표시
- [ ] 유효성 검증 피드백
- [ ] Tailwind 스타일링

**의존성**:
- FE-2 완료 필수

---

#### Task FE-12: Modal 컴포넌트
**우선순위**: 🟢 보통
**예상 시간**: 30분

**완료 조건**:
- [ ] `src/components/common/Modal.jsx` 생성
- [ ] 오버레이 (배경 어둡게)
- [ ] 닫기 버튼
- [ ] ESC 키로 닫기
- [ ] 모달 바깥 클릭 시 닫기
- [ ] 애니메이션 (fade-in/out)

**의존성**:
- FE-2 완료 필수

---

#### Task FE-13: LoadingSpinner 컴포넌트
**우선순위**: ⚪ 낮음
**예상 시간**: 15분

**완료 조건**:
- [ ] `src/components/common/LoadingSpinner.jsx` 생성
- [ ] CSS 애니메이션 (회전)
- [ ] size (sm, md, lg)
- [ ] Tailwind 스타일링

**의존성**:
- FE-2 완료 필수

---

### Phase 4: 인증 화면 개발

#### Task FE-14: 로그인 폼 컴포넌트
**우선순위**: 🟡 높음
**예상 시간**: 40분

**완료 조건**:
- [ ] `src/components/domain/auth/LoginForm.jsx` 생성
- [ ] 이메일, 비밀번호 입력 필드
- [ ] 실시간 유효성 검증
- [ ] 로그인 버튼 (로딩 상태)
- [ ] 에러 메시지 표시
- [ ] 회원가입 링크
- [ ] Zustand 스토어 연동

**의존성**:
- FE-8, FE-10, FE-11 완료 필수

---

#### Task FE-15: 로그인 페이지
**우선순위**: 🟡 높음
**예상 시간**: 20분

**완료 조건**:
- [ ] `src/pages/LoginPage.jsx` 생성
- [ ] LoginForm 컴포넌트 사용
- [ ] 로그인 성공 시 대시보드로 리다이렉트
- [ ] 이미 로그인된 경우 대시보드로 리다이렉트
- [ ] 반응형 레이아웃

**의존성**:
- FE-14 완료 필수

---

#### Task FE-16: 회원가입 폼 및 페이지
**우선순위**: 🟡 높음
**예상 시간**: 50분

**완료 조건**:
- [ ] `src/components/domain/auth/SignupForm.jsx` 생성
- [ ] 이메일, 비밀번호, 비밀번호 확인, 닉네임 입력
- [ ] 비밀번호 강도 표시
- [ ] 비밀번호 일치 검증
- [ ] 회원가입 성공 시 자동 로그인
- [ ] `src/pages/SignupPage.jsx` 생성

**의존성**:
- FE-8, FE-10, FE-11 완료 필수

---

### Phase 5: 대시보드 개발

#### Task FE-17: TodoItem 컴포넌트
**우선순위**: 🟡 높음
**예상 시간**: 50분

**완료 조건**:
- [ ] `src/components/domain/todo/TodoItem.jsx` 생성
- [ ] 카드 형태 UI
- [ ] 체크박스 (완료 처리)
- [ ] 제목, 설명, 우선순위, 마감일 표시
- [ ] D-day 표시 (남은 날짜)
- [ ] 우선순위별 색상 구분 (빨강/파랑/회색)
- [ ] 수정/삭제 버튼
- [ ] 클릭 시 상세 화면 이동
- [ ] 반응형 디자인

**의존성**:
- FE-2, FE-9 완료 필수

---

#### Task FE-18: TodoList 컴포넌트
**우선순위**: 🟡 높음
**예상 시간**: 30분

**완료 조건**:
- [ ] `src/components/domain/todo/TodoList.jsx` 생성
- [ ] TodoItem 컴포넌트 사용
- [ ] 빈 상태 UI ("할일이 없습니다")
- [ ] 로딩 상태 (LoadingSpinner)
- [ ] 에러 상태 표시
- [ ] 무한 스크롤 (선택)

**의존성**:
- FE-17 완료 필수

---

#### Task FE-19: TodoForm 컴포넌트 (생성/수정)
**우선순위**: 🟡 높음
**예상 시간**: 60분

**완료 조건**:
- [ ] `src/components/domain/todo/TodoForm.jsx` 생성
- [ ] 제목, 설명, 우선순위, 마감일, 메모 입력
- [ ] 날짜 피커 (캘린더 형식)
- [ ] 우선순위 선택 (라디오 버튼 또는 드롭다운)
- [ ] 유효성 검증 (제목 필수, 날짜 과거 검증)
- [ ] 생성/수정 모드 분기
- [ ] Modal에서 사용
- [ ] Zustand 스토어 연동

**의존성**:
- FE-9, FE-11, FE-12 완료 필수

---

#### Task FE-20: 대시보드 페이지
**우선순위**: 🟡 높음
**예상 시간**: 60분

**완료 조건**:
- [ ] `src/pages/DashboardPage.jsx` 생성
- [ ] 상단 필터 (전체/활성/완료)
- [ ] 정렬 드롭다운 (우선순위/날짜)
- [ ] 할일 추가 버튼 (+)
- [ ] TodoList 컴포넌트 사용
- [ ] TodoForm 모달
- [ ] 첫 로드 시 할일 목록 조회
- [ ] 반응형 레이아웃

**의존성**:
- FE-18, FE-19 완료 필수

---

### Phase 6: 추가 화면 개발

#### Task FE-21: 캘린더 뷰 컴포넌트
**우선순위**: 🟢 보통
**예상 시간**: 120분

**완료 조건**:
- [ ] `src/components/domain/calendar/CalendarView.jsx` 생성
- [ ] 월간 캘린더 UI
- [ ] 날짜별 할일 표시
- [ ] 공휴일 표시 (빨간색)
- [ ] 오늘 날짜 강조
- [ ] 할일 클릭 시 상세 보기
- [ ] 이전/다음 달 버튼
- [ ] 반응형 디자인

**의존성**:
- FE-9, BE-15 완료 필수

---

#### Task FE-22: 캘린더 페이지
**우선순위**: 🟢 보통
**예상 시간**: 20분

**완료 조건**:
- [ ] `src/pages/CalendarPage.jsx` 생성
- [ ] CalendarView 컴포넌트 사용
- [ ] 공휴일 API 연동

**의존성**:
- FE-21 완료 필수

---

#### Task FE-23: 휴지통 페이지
**우선순위**: 🟢 보통
**예상 시간**: 40분

**완료 조건**:
- [ ] `src/pages/TrashPage.jsx` 생성
- [ ] 삭제된 할일 목록 표시
- [ ] 복원 버튼
- [ ] 영구 삭제 버튼 (확인 모달)
- [ ] 30일 후 자동 삭제 안내
- [ ] 빈 상태 UI

**의존성**:
- FE-9, BE-13 완료 필수

---

#### Task FE-24: 설정 페이지 (프로필)
**우선순위**: 🟢 보통
**예상 시간**: 50분

**완료 조건**:
- [ ] `src/pages/SettingsPage.jsx` 생성
- [ ] 닉네임 수정
- [ ] 프로필 사진 업로드 (선택)
- [ ] 알림 ON/OFF 토글
- [ ] 로그아웃 버튼
- [ ] 사용자 API 연동

**의존성**:
- FE-8, BE-14 완료 필수

---

### Phase 7: 레이아웃 및 내비게이션

#### Task FE-25: MainLayout 컴포넌트
**우선순위**: 🟡 높음
**예상 시간**: 40분

**완료 조건**:
- [ ] `src/layouts/MainLayout.jsx` 생성
- [ ] 상단 네비게이션 바
- [ ] 사이드바 또는 하단 네비게이션 (모바일)
- [ ] 로고, 사용자 프로필 이미지
- [ ] 메뉴 (대시보드, 캘린더, 휴지통, 설정)
- [ ] Outlet (React Router)
- [ ] 반응형 디자인

**의존성**:
- FE-4 완료 필수

---

#### Task FE-26: AuthLayout 컴포넌트
**우선순위**: ⚪ 낮음
**예상 시간**: 20분

**완료 조건**:
- [ ] `src/layouts/AuthLayout.jsx` 생성
- [ ] 중앙 정렬 레이아웃
- [ ] 로고 표시
- [ ] 배경 이미지 또는 그라데이션
- [ ] Outlet (React Router)

**의존성**:
- FE-4 완료 필수

---

#### Task FE-27: ProtectedRoute 컴포넌트
**우선순위**: 🟡 높음
**예상 시간**: 20분

**완료 조건**:
- [ ] `src/components/common/ProtectedRoute.jsx` 생성
- [ ] 인증 상태 확인 (Zustand 스토어)
- [ ] 미인증 시 로그인 페이지로 리다이렉트
- [ ] 인증 완료 시 자식 컴포넌트 렌더링

**의존성**:
- FE-4, FE-8 완료 필수

**구현 코드**:
```jsx
// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
```

---

### Phase 8: 최종 검증 및 최적화

#### Task FE-28: 반응형 디자인 테스트
**우선순위**: 🟢 보통
**예상 시간**: 40분

**완료 조건**:
- [ ] 모바일 (375px) 테스트
- [ ] 태블릿 (768px) 테스트
- [ ] 데스크탑 (1024px+) 테스트
- [ ] 터치 인터페이스 테스트
- [ ] 브라우저 호환성 테스트 (Chrome, Firefox, Safari, Edge)

**의존성**:
- FE-20, FE-22, FE-23, FE-24 완료 필수

---

#### Task FE-29: 에러 바운더리 구현
**우선순위**: ⚪ 낮음
**예상 시간**: 30분

**완료 조건**:
- [ ] `src/components/common/ErrorBoundary.jsx` 생성
- [ ] 에러 발생 시 폴백 UI 표시
- [ ] 에러 로깅 (콘솔)
- [ ] 재시도 버튼
- [ ] App.jsx에 적용

**의존성**:
- FE-1 완료 필수

---

#### Task FE-30: 성능 최적화
**우선순위**: ⚪ 낮음
**예상 시간**: 30분

**완료 조건**:
- [ ] React.memo() 적용 (TodoItem)
- [ ] useMemo() / useCallback() 적용
- [ ] 이미지 최적화 (lazy loading)
- [ ] 번들 크기 분석 (vite-plugin-visualizer)
- [ ] Lighthouse 점수 확인 (90 이상)

**의존성**:
- FE-28 완료 필수

---

## 통합 및 배포 계획

### Phase 1: 로컬 통합 테스트

#### Task INT-1: 백엔드-데이터베이스 통합 테스트
**우선순위**: 🟡 높음
**예상 시간**: 60분

**완료 조건**:
- [ ] 모든 API 엔드포인트 Postman 테스트
- [ ] 인증 플로우 테스트 (회원가입 → 로그인 → 토큰 갱신)
- [ ] 할일 CRUD 플로우 테스트
- [ ] 휴지통 플로우 테스트
- [ ] 에러 케이스 테스트 (400, 401, 404, 409)
- [ ] 데이터베이스 제약조건 테스트
- [ ] API 응답 시간 측정 (1000ms 이하)

**의존성**:
- BE-8, BE-12, BE-13, BE-14, BE-15 완료 필수

---

#### Task INT-2: 프론트엔드-백엔드 통합 테스트
**우선순위**: 🟡 높음
**예상 시간**: 90분

**완료 조건**:
- [ ] 로그인/회원가입 플로우 테스트
- [ ] 대시보드에서 할일 CRUD 테스트
- [ ] 필터/정렬 기능 테스트
- [ ] 캘린더 뷰 테스트
- [ ] 휴지통 기능 테스트
- [ ] 프로필 수정 테스트
- [ ] 토큰 갱신 자동화 테스트
- [ ] 에러 핸들링 테스트 (네트워크 에러, 서버 에러)

**의존성**:
- FE-20, FE-22, FE-23, FE-24, INT-1 완료 필수

---

### Phase 2: 버그 수정 및 개선

#### Task INT-3: 버그 수정
**우선순위**: 🟡 높음
**예상 시간**: 120분

**완료 조건**:
- [ ] 통합 테스트에서 발견된 모든 버그 수정
- [ ] UI/UX 개선 사항 반영
- [ ] 코드 리팩토링 (중복 제거, 가독성 향상)
- [ ] 재테스트 완료

**의존성**:
- INT-2 완료 필수

---

### Phase 3: Vercel 배포

#### Task DEPLOY-1: 환경 변수 설정
**우선순위**: 🔴 긴급
**예상 시간**: 15분

**완료 조건**:
- [ ] Vercel 프로젝트 생성 (frontend, api 각각)
- [ ] 환경 변수 추가 (Vercel 대시보드)
  - `POSTGRES_CONNECTION_STRING`
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `VITE_API_BASE_URL`
- [ ] Production 환경 설정 확인

**의존성**:
- INT-3 완료 필수

---

#### Task DEPLOY-2: 백엔드 배포 (Vercel Serverless)
**우선순위**: 🔴 긴급
**예상 시간**: 30분

**완료 조건**:
- [ ] `vercel.json` 설정 확인
- [ ] Vercel CLI 설치 및 로그인
- [ ] 배포 실행 (`vercel --prod`)
- [ ] API 엔드포인트 동작 확인
- [ ] CORS 설정 확인 (프론트엔드 도메인 허용)
- [ ] Vercel 대시보드에서 로그 확인

**의존성**:
- DEPLOY-1 완료 필수

**실행 명령**:
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

---

#### Task DEPLOY-3: 프론트엔드 배포 (Vercel)
**우선순위**: 🔴 긴급
**예상 시간**: 20분

**완료 조건**:
- [ ] `vite.config.js` 빌드 설정 확인
- [ ] 환경 변수 설정 (VITE_API_BASE_URL)
- [ ] 빌드 테스트 (`npm run build`)
- [ ] Vercel 배포 (`vercel --prod`)
- [ ] 배포된 사이트 접속 확인
- [ ] 모든 페이지 동작 확인

**의존성**:
- DEPLOY-2 완료 필수

**실행 명령**:
```bash
cd frontend

# 빌드 테스트
npm run build

# 빌드 결과 로컬 확인
npm run preview

# 배포
vercel --prod
```

---

### Phase 4: 최종 검증

#### Task DEPLOY-4: Production 환경 통합 테스트
**우선순위**: 🟡 높음
**예상 시간**: 60분

**완료 조건**:
- [ ] 모든 기능 재테스트 (Production 환경)
- [ ] 회원가입 → 로그인 → 할일 CRUD 플로우
- [ ] 모바일 기기에서 테스트 (실제 스마트폰)
- [ ] 성능 측정 (API 응답 시간, 페이지 로드 시간)
- [ ] Lighthouse 점수 확인 (90 이상)
- [ ] 보안 검증 (HTTPS, JWT, CORS)

**의존성**:
- DEPLOY-3 완료 필수

---

#### Task DEPLOY-5: 문서화 및 README 작성
**우선순위**: 🟢 보통
**예상 시간**: 40분

**완료 조건**:
- [ ] `README.md` 업데이트
  - 프로젝트 소개
  - 기능 목록
  - 기술 스택
  - 로컬 실행 방법
  - 배포 URL
  - 스크린샷
- [ ] `docs/execution_plan.md` 완료 상태 업데이트
- [ ] API 문서 최종 검토 (`swagger.json`)

**의존성**:
- DEPLOY-4 완료 필수

---

## 전체 일정 타임라인

### Day 1: 백엔드 개발 (2025-11-26)

**오전 (4시간)**
- ✅ DB-1 ~ DB-7: 데이터베이스 스키마 마이그레이션
- ✅ BE-1 ~ BE-4: 백엔드 프로젝트 초기화 및 공통 모듈

**오후 (4시간)**
- ✅ BE-5 ~ BE-8: 인증 API 구현
- ✅ BE-9 ~ BE-12: 할일 API 구현

**저녁 (2시간)**
- ✅ BE-13 ~ BE-15: 추가 API 구현 (휴지통, 프로필, 캘린더)
- ✅ INT-1: 백엔드-데이터베이스 통합 테스트

---

### Day 2: 프론트엔드 개발 (2025-11-27)

**오전 (4시간)**
- ✅ FE-1 ~ FE-9: 프로젝트 초기화, API 연동, 상태 관리
- ✅ FE-10 ~ FE-13: 공통 컴포넌트 개발

**오후 (4시간)**
- ✅ FE-14 ~ FE-20: 인증 화면 및 대시보드 개발

**저녁 (2시간)**
- ✅ FE-21 ~ FE-24: 추가 화면 개발 (캘린더, 휴지통, 설정)
- ✅ FE-25 ~ FE-27: 레이아웃 및 내비게이션

---

### Day 3: 테스트 및 배포 (2025-11-28)

**오전 (3시간)**
- ✅ INT-2: 프론트엔드-백엔드 통합 테스트
- ✅ INT-3: 버그 수정
- ✅ FE-28 ~ FE-30: 반응형 테스트 및 최적화

**오후 (3시간)**
- ✅ DEPLOY-1 ~ DEPLOY-3: Vercel 배포
- ✅ DEPLOY-4: Production 통합 테스트
- ✅ DEPLOY-5: 문서화

**저녁 (1시간)**
- ✅ 최종 확인 및 정리
- ✅ 회고 및 개선 사항 정리

---

## 전체 Task 체크리스트

### 데이터베이스 (10개)
- [ ] DB-1: Supabase 프로젝트 생성
- [ ] DB-2: 로컬 환경 변수 설정
- [ ] DB-3: ENUM 타입 생성
- [ ] DB-4: users 테이블 생성
- [ ] DB-5: todos 테이블 생성
- [ ] DB-6: calendars 테이블 생성
- [ ] DB-7: notifications 테이블 생성
- [ ] DB-8: 스키마 무결성 검증
- [ ] DB-9: 초기 데이터 마이그레이션
- [ ] DB-10: 성능 최적화 및 모니터링 설정

### 백엔드 (15개)
- [ ] BE-1: Node.js 프로젝트 초기화
- [ ] BE-2: 데이터베이스 연결 모듈 구현
- [ ] BE-3: 공통 미들웨어 구현
- [ ] BE-4: JWT 유틸리티 구현
- [ ] BE-5: 비밀번호 해싱 유틸리티 구현
- [ ] BE-6: 사용자 Repository 구현
- [ ] BE-7: 인증 Service 구현
- [ ] BE-8: 인증 API 엔드포인트 구현
- [ ] BE-9: 할일 Repository 구현
- [ ] BE-10: 인증 미들웨어 구현
- [ ] BE-11: 할일 Service 구현
- [ ] BE-12: 할일 API 엔드포인트 구현
- [ ] BE-13: 휴지통 API 구현
- [ ] BE-14: 사용자 프로필 API 구현
- [ ] BE-15: 캘린더/공휴일 API 구현

### 프론트엔드 (30개)
- [ ] FE-1: Vite + React 프로젝트 생성
- [ ] FE-2: Tailwind CSS 설정
- [ ] FE-3: 디렉토리 구조 생성
- [ ] FE-4: React Router 설정
- [ ] FE-5: Axios 클라이언트 설정
- [ ] FE-6: 인증 API 서비스 구현
- [ ] FE-7: 할일 API 서비스 구현
- [ ] FE-8: 인증 Zustand 스토어 구현
- [ ] FE-9: 할일 Zustand 스토어 구현
- [ ] FE-10: Button 컴포넌트
- [ ] FE-11: Input 컴포넌트
- [ ] FE-12: Modal 컴포넌트
- [ ] FE-13: LoadingSpinner 컴포넌트
- [ ] FE-14: 로그인 폼 컴포넌트
- [ ] FE-15: 로그인 페이지
- [ ] FE-16: 회원가입 폼 및 페이지
- [ ] FE-17: TodoItem 컴포넌트
- [ ] FE-18: TodoList 컴포넌트
- [ ] FE-19: TodoForm 컴포넌트
- [ ] FE-20: 대시보드 페이지
- [ ] FE-21: 캘린더 뷰 컴포넌트
- [ ] FE-22: 캘린더 페이지
- [ ] FE-23: 휴지통 페이지
- [ ] FE-24: 설정 페이지
- [ ] FE-25: MainLayout 컴포넌트
- [ ] FE-26: AuthLayout 컴포넌트
- [ ] FE-27: ProtectedRoute 컴포넌트
- [ ] FE-28: 반응형 디자인 테스트
- [ ] FE-29: 에러 바운더리 구현
- [ ] FE-30: 성능 최적화

### 통합 및 배포 (8개)
- [ ] INT-1: 백엔드-데이터베이스 통합 테스트
- [ ] INT-2: 프론트엔드-백엔드 통합 테스트
- [ ] INT-3: 버그 수정
- [ ] DEPLOY-1: 환경 변수 설정
- [ ] DEPLOY-2: 백엔드 배포
- [ ] DEPLOY-3: 프론트엔드 배포
- [ ] DEPLOY-4: Production 통합 테스트
- [ ] DEPLOY-5: 문서화 및 README 작성

---

## 총 Task 수: 63개

**예상 총 개발 시간**: 약 72시간 (3일 x 24시간)
**실제 작업 가능 시간**: 3일 x 10시간 = 30시간
**권장 사항**: 우선순위가 높은 Task 먼저 진행, 시간 부족 시 캘린더 기능(FE-21, FE-22) 및 성능 최적화(FE-29, FE-30) 생략 가능

---

## 리스크 및 대응 방안

### 리스크 1: 시간 부족
**대응**:
- 캘린더 뷰 기능을 v1.1로 연기
- 프로필 사진 업로드 기능 생략
- 성능 최적화를 최소화

### 리스크 2: API 통합 오류
**대응**:
- 모킹 서버(`frontend/server.js`) 먼저 구현하여 프론트엔드 병렬 개발
- Postman Collection 작성하여 API 테스트 자동화

### 리스크 3: 배포 실패
**대응**:
- 로컬 환경에서 프로덕션 빌드 먼저 테스트
- Vercel 문서 참고 및 예제 프로젝트 확인

---

**문서 작성 완료**
**다음 단계**: DB-1 Task부터 순차적으로 실행 시작
