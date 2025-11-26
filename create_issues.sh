#!/bin/bash

# DB-1: Supabase 프로젝트 생성
gh issue create --title "Stage DB-1: Supabase 프로젝트 생성" --body "**Labels**:
- 종류: infra
- 영역: database
- 복잡도: low

**Todo**:
- [x] Supabase 계정 생성 완료
- [x] 새 프로젝트 WHATtodo 생성 완료
- [x] PostgreSQL 데이터베이스 인스턴스 활성화 확인
- [x] 연결 문자열 획득 (connection string)
- [x] .env 파일에 연결 정보 저장

**완료 조건**:
- Supabase 프로젝트 URL 확보
- PostgreSQL 연결 문자열 확보
- API Keys (anon, service_role) 발급
- 데이터베이스 접속 테스트 성공

**기술적 고려사항**:
- Supabase 무료 티어 사용
- PostgreSQL 14+ 버전 사용
- 연결 문자열은 환경 변수로 관리 (.env)
- .gitignore에 .env 파일 추가 필수

**의존성**:
- 선행 작업: 없음
- 후속 작업: DB-2 (로컬 환경 변수 설정)" --label "infra,database,complexity:low"

# DB-2: 로컬 환경 변수 설정
gh issue create --title "Stage DB-2: 로컬 환경 변수 설정" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: low

**Todo**:
- [x] .env 파일에 Supabase 연결 문자열 추가
- [x] .env.example 파일 생성 (템플릿)
- [x] .gitignore에 .env 포함 확인

**완료 조건**:
- .env 파일에 POSTGRES_CONNECTION_STRING 설정 완료
- .env.example 템플릿 파일 생성
- Node.js에서 환경 변수 로드 테스트 성공

**기술적 고려사항**:
- dotenv 패키지 사용
- 환경 변수 키 네이밍 일관성 유지
- 민감 정보 절대 Git에 커밋하지 않기

**의존성**:
- 선행 작업: DB-1 완료 필수
- 후속 작업: DB-3 (ENUM 타입 생성)" --label "feature,database,complexity:low"

# DB-3: ENUM 타입 생성
gh issue create --title "Stage DB-3: ENUM 타입 생성" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: low

**Todo**:
- [x] priority_enum 생성 (HIGH, NORMAL, LOW)
- [x] status_enum 생성 (ACTIVE, COMPLETED, DELETED)
- [x] notification_type_enum 생성 (D_MINUS_1, D_DAY)
- [x] day_of_week_enum 생성 (MONDAY ~ SUNDAY)
- [x] ENUM 타입 조회로 확인

**완료 조건**:
- 4개의 ENUM 타입이 PostgreSQL에 생성됨
- 검증 쿼리 SELECT typname FROM pg_type WHERE typname LIKE '%_enum'; 실행 시 4개 반환

**기술적 고려사항**:
- PostgreSQL의 ENUM 타입 활용
- 추후 값 추가 시 ALTER TYPE 사용 가능
- 테이블 생성 전 ENUM 타입 먼저 정의

**의존성**:
- 선행 작업: DB-2 완료 필수
- 후속 작업: DB-4 (users 테이블 생성)" --label "feature,database,complexity:low"

# DB-4: users 테이블 생성
gh issue create --title "Stage DB-4: users 테이블 생성" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: medium

**Todo**:
- [x] users 테이블 생성 (8개 컬럼)
- [x] PRIMARY KEY 제약조건 설정 (user_id)
- [x] UNIQUE 제약조건 설정 (email)
- [x] DEFAULT 값 설정 (user_id, notification_enabled, created_at)
- [x] 인덱스 생성 (email, created_at)
- [ ] 테스트 레코드 삽입 및 조회 확인

**완료 조건**:
- users 테이블 생성 완료
- 이메일 형식 검증 CHECK 제약조건 적용
- 닉네임 길이 검증 (2-20자) CHECK 제약조건 적용
- 인덱스 2개 생성 완료
- 테스트 사용자 데이터 삽입 및 조회 성공

**기술적 고려사항**:
- UUID 타입의 PRIMARY KEY 사용 (gen_random_uuid())
- 비밀번호는 해시 형태로 저장 (bcrypt 사용)
- 이메일 형식 정규식 검증
- 인덱스를 통한 조회 성능 최적화

**의존성**:
- 선행 작업: DB-3 완료 필수
- 후속 작업: DB-5 (todos 테이블 생성)" --label "feature,database,complexity:medium"

# DB-5: todos 테이블 생성
gh issue create --title "Stage DB-5: todos 테이블 생성" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: high

**Todo**:
- [x] todos 테이블 생성 (12개 컬럼)
- [x] PRIMARY KEY 제약조건 (todo_id)
- [x] FOREIGN KEY 제약조건 (user_id → users)
- [x] CASCADE 삭제 설정
- [x] 5개 인덱스 생성 (user_id, due_date, status, 복합, 부분)
- [ ] 테스트 레코드 삽입 및 외래키 검증

**완료 조건**:
- todos 테이블 생성 완료
- 외래키 제약조건 fk_todos_users 설정 완료 (ON DELETE CASCADE)
- 상태/완료일/삭제일 간 일관성을 보장하는 CHECK 제약조건 적용
- 인덱스 5개 이상 생성 완료
- 테스트 할일 데이터 삽입 및 외래키 동작 확인

**기술적 고려사항**:
- ENUM 타입 사용 (priority_enum, status_enum)
- updated_at 자동 갱신을 위한 트리거 설정
- 부분 인덱스 활용 (deleted_at에 대한 WHERE 조건부 인덱스)
- 복합 인덱스로 사용자별/상태별 조회 최적화

**의존성**:
- 선행 작업: DB-4 완료 필수
- 후속 작업: DB-6 (calendars 테이블 생성), DB-7 (notifications 테이블 생성)" --label "feature,database,complexity:high"

# DB-6: calendars 테이블 생성
gh issue create --title "Stage DB-6: calendars 테이블 생성" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: medium

**Todo**:
- [x] calendars 테이블 생성 (8개 컬럼)
- [x] PRIMARY KEY 제약조건 (date)
- [x] 2개 인덱스 생성 (year+month, is_holiday 부분)
- [x] 2025년 1월 ~ 12월 날짜 데이터 일괄 삽입
- [x] 공휴일 데이터 삽입 (최소 10개 이상)

**완료 조건**:
- calendars 테이블 생성 완료
- 2025년 365일 데이터 삽입 완료
- 대한민국 공휴일 15개 이상 등록 완료
- 인덱스 2개 생성 완료
- 공휴일 조회 쿼리 성공

**기술적 고려사항**:
- generate_series를 활용한 대량 날짜 데이터 생성
- 부분 인덱스를 통한 공휴일 조회 최적화
- 연/월 복합 인덱스로 월별 캘린더 조회 성능 향상
- 향후 년도 데이터 추가를 위한 스크립트 재사용성 고려

**의존성**:
- 선행 작업: DB-3 완료 필수
- 후속 작업: DB-8 (스키마 무결성 검증)" --label "feature,database,complexity:medium"

# DB-7: notifications 테이블 생성
gh issue create --title "Stage DB-7: notifications 테이블 생성" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: medium

**Todo**:
- [x] notifications 테이블 생성 (9개 컬럼)
- [x] PRIMARY KEY 제약조건 (notification_id)
- [x] 2개 FOREIGN KEY 제약조건 (user_id, todo_id)
- [x] CASCADE 삭제 설정
- [x] 3개 인덱스 생성
- [ ] 테스트 알림 레코드 삽입

**완료 조건**:
- notifications 테이블 생성 완료
- 외래키 제약조건 2개 설정 완료 (ON DELETE CASCADE)
- 발송 상태와 발송 시각의 일관성 CHECK 제약조건 적용
- 인덱스 3개 생성 완료 (user_id, todo_id, 부분 인덱스)
- 테스트 알림 데이터 삽입 성공

**기술적 고려사항**:
- ENUM 타입 사용 (notification_type_enum)
- 미발송 알림 조회를 위한 부분 인덱스 (WHERE is_sent = false)
- scheduled_at 시각은 반드시 미래여야 함 (CHECK 제약조건)
- 할일 또는 사용자 삭제 시 알림도 자동 삭제 (CASCADE)

**의존성**:
- 선행 작업: DB-4, DB-5 완료 필수
- 후속 작업: DB-8 (스키마 무결성 검증)" --label "feature,database,complexity:medium"

# DB-8: 스키마 무결성 검증
gh issue create --title "Stage DB-8: 스키마 무결성 검증" --body "**Labels**:
- 종류: test
- 영역: database
- 복잡도: medium

**Todo**:
- [x] 모든 테이블 생성 확인 (4개)
- [x] 모든 ENUM 타입 확인 (4개)
- [x] 모든 인덱스 생성 확인 (13개 이상)
- [ ] 외래키 제약조건 동작 확인 (CASCADE 테스트)
- [ ] 테스트 데이터 삽입 및 조회 성공

**완료 조건**:
- 테이블 목록 쿼리 결과: users, todos, calendars, notifications
- ENUM 타입 쿼리 결과: 4개
- 인덱스 쿼리 결과: 13개 이상
- CASCADE 삭제 테스트 성공 (사용자 삭제 시 할일/알림 자동 삭제)
- 모든 검증 쿼리 에러 없이 통과

**기술적 고려사항**:
- verify_schema_integrity.sql 스크립트 활용
- 테스트는 트랜잭션 내에서 실행 후 ROLLBACK
- 외래키 관계 확인을 위한 메타데이터 쿼리 사용
- 데이터 무결성 제약조건 검증

**의존성**:
- 선행 작업: DB-4, DB-5, DB-6, DB-7 완료 필수
- 후속 작업: DB-9 (초기 데이터 마이그레이션)" --label "test,database,complexity:medium"

# DB-9: 초기 데이터 마이그레이션
gh issue create --title "Stage DB-9: 초기 데이터 마이그레이션" --body "**Labels**:
- 종류: feature
- 영역: database
- 복잡도: medium

**Todo**:
- [ ] 2025년 전체 날짜 데이터 삽입 (365일)
- [ ] 대한민국 공휴일 데이터 삽입 (15개 이상)
- [ ] 테스트 사용자 계정 3개 생성
- [ ] 샘플 할일 10개 생성 (다양한 우선순위, 상태)
- [ ] 샘플 알림 5개 생성

**완료 조건**:
- calendars 테이블에 365개 레코드 존재
- 공휴일 15개 이상 등록
- users 테이블에 3개 테스트 사용자 존재
- todos 테이블에 10개 샘플 할일 존재
- notifications 테이블에 5개 샘플 알림 존재

**기술적 고려사항**:
- 비밀번호는 bcrypt 해싱 값으로 저장
- 다양한 우선순위(HIGH, NORMAL, LOW) 및 상태(ACTIVE, COMPLETED, DELETED) 포함
- 마감일이 있는 할일과 없는 할일 모두 포함
- 발송 완료/미완료 알림 모두 포함

**의존성**:
- 선행 작업: DB-8 완료 필수
- 후속 작업: DB-10 (성능 최적화)" --label "feature,database,complexity:medium"

# DB-10: 성능 최적화 및 모니터링 설정
gh issue create --title "Stage DB-10: 성능 최적화 및 모니터링 설정" --body "**Labels**:
- 종류: optimization
- 영역: database
- 복잡도: low

**Todo**:
- [ ] ANALYZE 실행 (통계 정보 갱신)
- [ ] VACUUM 실행 (데드 튜플 정리)
- [ ] 느린 쿼리 로깅 활성화
- [ ] 연결 풀 설정 확인
- [ ] 백업 정책 확인 (Supabase 자동 백업)

**완료 조건**:
- 모든 테이블에 대해 ANALYZE 실행 완료
- VACUUM ANALYZE 실행 완료
- Supabase Connection Pooling 설정 확인
- 일일 자동 백업 활성화 확인

**기술적 고려사항**:
- PostgreSQL 쿼리 플래너 최적화를 위한 통계 정보 최신화
- Connection Pooling 설정 (max: 20, idle timeout: 30초)
- Supabase 대시보드에서 백업 설정 확인

**의존성**:
- 선행 작업: DB-9 완료 필수
- 후속 작업: 백엔드 개발 시작" --label "optimization,database,complexity:low"

echo "데이터베이스 이슈 10개 생성 완료"
