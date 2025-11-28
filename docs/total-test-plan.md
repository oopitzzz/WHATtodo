WHATtodo 로컬 통합 테스트 실행 계획

개요

WHATtodo 프로젝트의 백엔드-데이터베이스 및 프론트엔드-백엔드 통합 테스트를 위한 실행
계획입니다.

테스트 범위:

- INT-1: 백엔드-데이터베이스 통합 테스트 (Postman 사용)
- INT-2: 프론트엔드-백엔드 통합 테스트 (수동 브라우저 테스트)

사용자 선택사항:

- 테스트 도구: Postman 컬렉션
- DB 환경: 현재 Supabase 프로덕션 DB
- FE 테스트: 수동 브라우저 테스트
- 결과 문서화: 마크다운 파일

---

1.  사전 준비 단계

1.1 환경 변수 파일 생성

백엔드 .env 확인

위치: C:\Users\eunww\WHATtodo\backend\.env

현재 파일이 존재하며 다음 내용 포함:

- POSTGRES_CONNECTION_STRING: Supabase PostgreSQL 연결 문자열
- JWT_SECRET: JWT 토큰 시크릿
- PORT: 3000
- NODE_ENV: development

프론트엔드 .env 생성 필요

위치: C:\Users\eunww\WHATtodo\frontend\.env

VITE_API_BASE_URL=http://localhost:3000/api

실행 명령:
cd C:\Users\eunww\WHATtodo\frontend
echo VITE_API_BASE_URL=http://localhost:3000/api > .env

1.2 서버 실행

터미널 1 - 백엔드:
cd C:\Users\eunww\WHATtodo\backend
npm run dev

확인사항:

- 콘솔: "API server listening on port 3000"
- http://localhost:3000/h

터미널 2 - 프론트엔드:
cd C:\Users\eunww\WHATtodo\frontend
npm run dev

확인사항:

- 콘솔: "Local: http://localho
- 브라우저 접속 확인

---

2.  INT-1: 백엔드-데이터베이스 통합 테스트

2.1 Postman 컬렉션 생성

폴더 구조

WHATtodo API Integration Tests
├── 01. Health Check
├── 02. Authentication Flow
├── 03. Todos - CRUD Operations
├── 04. Todos - Filtering & Sorting
├── 05. Trash Management
├── 06. User Profile
├── 07. Calendar
└── 08. Error Cases

Environment 설정

Postman Environment 생성: WHATtodo Local

| Variable     | Initial Value                |
| ------------ | ---------------------------- |
| base_url     | http://localhost:3000        |
| testEmail    | test-20251127-01@example.com |
| testPassword | testPassword123              |
| testNickname | 테스트계정-01                |
| accessToken  | (자동 저장)                  |
| refreshToken | (자동 저장)                  |
| todoId       | (자동 저장)                  |

2.2 주요 테스트 시나리오

A. 인증 플로우 (필수 순서대로 실행)

1.  POST {{base_url}}/api/auth/signup

- Body: { "email": "{{testEmail}}", "password": "{{testPassword}}", "nickname":
  "{{testNickname}}" }
- Test Script: 토큰을 environment에 자동 저장
- 검증: 201 Created, accessToken/refreshToken 발급

2.  POST {{base_url}}/api/auth/login

- Body: { "email": "{{testEmail}}", "password": "{{testPassword}}" }
- Test Script: 토큰 업데이트
- 검증: 200 OK, 사용자 정보 일치

3.  POST {{base_url}}/api/auth/refresh

- Body: { "refreshToken": "{{refreshToken}}" }
- 검증: 200 OK, 새 accessToken 발급

4.  POST {{base_url}}/api/auth/logout

- 검증: 200 OK, 성공 메시지

B. 할일 CRUD (Authorization 헤더 필수)

1.  POST {{base_url}}/api/todos

- Headers: Authorization: Bearer {{accessToken}}
- Body: { "title": "Postman 테스트 할일", "priority": "HIGH", "dueDate": "2025-12-31" }
- Test Script: todoId 저장
- 검증: 201 Created

2.  GET {{base_url}}/api/todos

- 검증: 200 OK, 배열 반환

3.  GET {{base_url}}/api/todos/{{todoId}}

- 검증: 200 OK, 상세 정보

4.  PUT {{base_url}}/api/todos/{{todoId}}

- Body: { "title": "수정된 제목", "priority": "NORMAL" }
- 검증: 200 OK

5.  PATCH {{base_url}}/api/todos/{{todoId}}/complete

- 검증: 200 OK, status=COMPLETED

6.  DELETE {{base_url}}/api/todos/{{todoId}}

- 검증: 200 OK, status=DELETED

7.  PATCH {{base_url}}/api/todos/{{todoId}}/restore

- Body: { "status": "ACTIVE" }
- 검증: 200 OK

C. 필터링/정렬

1.  GET {{base_url}}/api/todos?status=ACTIVE
2.  GET {{base_url}}/api/todos?priority=HIGH
3.  GET {{base_url}}/api/todos?sortBy=due_date&sortDirection=asc
4.  GET {{base_url}}/api/todos?limit=5&offset=0

D. 휴지통

1.  GET {{base_url}}/api/trash?page=1&pageSize=10
2.  DELETE {{base_url}}/api/trash/{{todoId}}

- 검증: 204 No Content

E. 사용자 프로필

1.  GET {{base_url}}/api/users/me
2.  PUT {{base_url}}/api/users/me

- Body: { "nickname": "수정된 닉네임", "notificationEnabled": true }

F. 캘린더

1.  GET {{base_url}}/api/calendar/holidays?year=2025&month=12

G. 에러 케이스

1.  POST {{base_url}}/api/auth/signup (중복 이메일)

- 검증: 409 Conflict

2.  POST {{base_url}}/api/auth/login (잘못된 비밀번호)

- Body: { "email": "{{testEmail}}", "password": "wrong" }
- 검증: 401 Unauthorized

3.  GET {{base_url}}/api/todos (토큰 없음)

- Headers: Authorization 제거
- 검증: 401 Unauthorized

4.  POST {{base_url}}/api/todos (제목 누락)

- Body: { "description": "제목 없음" }
- 검증: 400 Bad Request

5.  POST {{base_url}}/api/todos (과거 마감일)

- Body: { "title": "테스트", "dueDate": "2020-01-01" }
- 검증: 400 Bad Request

  2.3 응답 시간 검증

모든 요청의 Test Script에 추가:
pm.test("Response time is less than 1000ms", function () {
pm.expect(pm.response.responseTime).to.be.below(1000);
});

2.4 실행 방법

1.  Postman에서 Collection Runner 실행
2.  환경: WHATtodo Local 선택
3.  Delay: 200ms
4.  순차 실행 (Authentication → Todos → Trash → User → Calendar → Errors)
5.  결과 스크린샷 캡처

---

3.  INT-2: 프론트엔드-백엔드 통합 테스트

3.1 테스트 계정 준비

Email: frontend-test@example.com
Password: testPassword123
Nickname: 프론트테스터

3.2 테스트 시나리오

A. 회원가입 플로우 ✓

단계:

1.  http://localhost:5
2.  폼 렌더링 확인
3.  입력 필드 검증 테스트 (빈 값, 짧은 비밀번호)
4.  정상 회원가입 수행
5.  대시보드로 자동 리다이렉트 확인
6.  LocalStorage에 accessToken, refreshToken 확인 (F12 → Application 탭)
7.  Network 탭: POST /api/auth/signup → 201 Created 확인

체크리스트:

- 폼 렌더링 정상
- 이메일 형식 검증
- 비밀번호 길이 검증 (8자 이상)
- 닉네임 길이 검증 (2-20자)
- 비밀번호 확인 일치 검증
- 회원가입 성공 시 대시보드 이동
- 토큰 LocalStorage 저장
- 중복 이메일 에러 처리 (409)

B. 로그인 플로우 ✓

단계:

1.  http://localhost:5
2.  잘못된 비밀번호로 로그인 시도
3.  에러 메시지 확인 ("이메일 또는 비밀번호가 일치하지 않습니다")
4.  올바른 정보로 로그인
5.  대시보드 이동 확인

체크리스트:

- 로그인 폼 렌더링
- 에러 처리 (401)
- 로그인 성공 시 대시보드 이동
- 토큰 업데이트 확인

C. 할일 생성 ✓

단계:

1.  대시보드에서 "+ 새 할일" 버튼 클릭
2.  모달 폼 표시 확인
3.  제목 없이 제출 시도 → 검증 메시지 확인
4.  정상 데이터 입력:

- 제목: "통합 테스트 할일"
- 설명: "프론트엔드 통합 테스트용"
- 우선순위: HIGH
- 마감일: 2025-12-31

5.  "추가" 버튼 클릭
6.  목록에 즉시 추가되는지 확인
7.  Network: POST /api/todos → 201 Created

체크리스트:

- 생성 폼 모달 표시
- 제목 필수 검증
- 과거 마감일 검증
- 생성 성공 후 목록 업데이트
- 성공 메시지 표시 (있다면)

D. 할일 목록 조회 ✓

체크리스트:

- 목록 렌더링
- 제목, 마감일, 우선순위 표시
- D-day 계산 정확
- 로딩 스피너 표시
- 빈 상태 메시지 (할일 없을 때)

E. 할일 수정 ✓

단계:

1.  할일 항목의 "수정" 버튼 클릭
2.  수정 모달 표시, 기존 값 로드 확인
3.  제목/우선순위 변경
4.  "저장" 버튼 클릭
5.  목록에 즉시 반영 확인
6.  Network: PUT /api/todos/:id → 200 OK

체크리스트:

- 수정 폼 표시
- 기존 값 로드
- 수정 성공
- UI 즉시 업데이트

F. 할일 완료 처리 ✓

단계:

1.  할일 체크박스 클릭
2.  취소선 스타일 적용 확인
3.  Network: PATCH /api/todos/:id/complete → 200 OK

체크리스트:

- 체크박스 클릭 작동
- 완료 스타일 적용 (취소선, 투명도)
- 상태 변경 확인

G. 할일 삭제 ✓

단계:

1.  "삭제" 버튼 클릭
2.  확인 모달 표시 (있다면)
3.  "확인" 클릭
4.  목록에서 제거 확인
5.  휴지통 페이지에서 확인
6.  Network: DELETE /api/todos/:id → 200 OK

체크리스트:

- 삭제 확인 모달 (있다면)
- 목록에서 제거
- 휴지통으로 이동 확인

H. 필터/정렬 ✓

단계:

1.  상태 필터: "진행 중" 선택
2.  ACTIVE 상태만 표시되는지 확인
3.  정렬: "마감일 순" 선택
4.  마감일 빠른 순으로 정렬 확인
5.  Network: GET /api/todos?status=ACTIVE&sortBy=due_date

체크리스트:

- 상태 필터 작동 (ACTIVE, COMPLETED, all)
- 우선순위 필터 (있다면)
- 정렬 기준 변경 (created_at, due_date, priority)
- 정렬 방향 변경 (ASC, DESC)

I. 캘린더 뷰 ✓

단계:

1.  http://localhost:5
2.  캘린더 렌더링 확인
3.  현재 월 표시 확인
4.  할일이 있는 날짜에 점 또는 숫자 표시 확인
5.  공휴일 표시 확인 (색상 강조)
6.  "다음 달" 버튼 클릭
7.  Network: GET /api/calendar/holidays?year=2025&month=12

체크리스트:

- 캘린더 그리드 렌더링
- 오늘 날짜 강조
- 할일 개수 표시
- 공휴일 표시
- 월 네비게이션 작동

J. 휴지통 ✓

단계:

1.  http://localhost:5
2.  삭제된 할일 목록 확인
3.  "복원" 버튼 클릭
4.  대시보드에 다시 나타나는지 확인
5.  다른 항목 "영구 삭제" 클릭
6.  확인 모달 → "확인"
7.  Network: GET /api/trash, PATCH /api/todos/:id/restore, DELETE /api/trash/:id

체크리스트:

- 휴지통 목록 표시
- 복원 기능 작동
- 영구 삭제 작동 (204 No Content)
- 페이지네이션 (있다면)

K. 프로필 수정 ✓

단계:

1.  http://localhost:5
2.  현재 프로필 정보 표시 확인
3.  닉네임 변경: "수정된 닉네임"
4.  알림 토글 클릭
5.  "저장" 버튼 클릭
6.  성공 메시지 확인
7.  Network: GET /api/users/me, PUT /api/users/me

체크리스트:

- 프로필 조회 성공
- 닉네임 수정 (2-20자 검증)
- 알림 설정 토글
- 저장 성공 메시지

L. 토큰 갱신 자동화 ✓

단계:

1.  F12 → Application → LocalStorage
2.  accessToken을 잘못된 값으로 변경: "invalid-token"
3.  할일 목록 새로고침 (F5)
4.  Network 탭 확인:

- GET /api/todos → 401 Unauthorized
- POST /api/auth/refresh → 200 OK
- GET /api/todos (재시도) → 200 OK

5.  LocalStorage의 accessToken 업데이트 확인

체크리스트:

- 401 에러 감지
- 자동으로 /api/auth/refresh 호출
- 새 토큰 저장
- 원래 요청 재시도
- 데이터 정상 로드

M. 에러 핸들링 ✓

1.  네트워크 에러:

- 백엔드 서버 중지 (Ctrl+C)
- 프론트엔드에서 할일 조회
- 에러 메시지 표시 확인
- 재시도 버튼 (있다면) 작동 확인

2.  400 에러:

- 제목 없이 할일 생성 시도
- "제목을 입력해주세요" 메시지 확인

3.  404 에러:

- http://localhost:5
- 404 페이지 렌더링 확인

체크리스트:

- 네트워크 에러 메시지
- 400 에러 메시지
- 404 페이지
- 500 에러 처리 (있다면)

  3.3 스크린샷 캡처

캡처 대상:

1.  회원가입 화면
2.  로그인 화면
3.  대시보드 (할일 목록)
4.  할일 생성 모달
5.  캘린더 뷰
6.  휴지통 페이지
7.  설정 페이지
8.  에러 메시지 예시
9.  Network 탭 (주요 API)

저장 위치: C:\Users\eunww\WHATtodo\docs\screenshots\int-2\

---

4.  결과 문서화

4.1 INT-1 결과 문서

파일: C:\Users\eunww\WHATtodo\docs\INT-1-backend-test-results.md

포함 내용:

- 테스트 요약 (성공/실패 통계)
- API 엔드포인트별 상세 결과
- 응답 시간 분석 (평균, 최대, 목표 대비)
- 데이터베이스 제약조건 검증 결과
- 발견된 이슈 (우선순위 포함)
- Postman Collection Runner 스크린샷

  4.2 INT-2 결과 문서

파일: C:\Users\eunww\WHATtodo\docs\INT-2-frontend-test-results.md

포함 내용:

- 테스트 요약 (기능별 성공/실패)
- 시나리오별 상세 체크리스트 결과
- UI/UX 관찰 사항
- 발견된 이슈
- 스크린샷 (주요 화면 및 에러)
- Network 분석 요약

  4.3 execution_plan.md 업데이트

INT-1, INT-2의 완료 조건 체크박스를 업데이트:

- 각 체크리스트 항목을 [x]로 변경
- 테스트 완료 일시 기록

---

5.  주의사항

5.1 프로덕션 DB 사용

테스트 데이터 네이밍:

- 이메일: test-20251127-01@example.com (날짜 포함)
- 닉네임: 테스트계정-01
- 할일 제목: [TEST] 통합 테스트 할일

테스트 후 데이터 정리:
-- Supabase SQL Editor에서 실행
DELETE FROM todos WHERE user_id IN (
SELECT user_id FROM users WHERE email LIKE 'test-%@example.com'
);
DELETE FROM users WHERE email LIKE 'test-%@example.com';

5.2 테스트 실행 순서

1.  INT-1 먼저 실행 (백엔드 검증)
2.  발견된 이슈 수정
3.  INT-2 실행 (프론트엔드 검증)
4.  전체 결과 문서화

5.3 발견된 이슈 처리

우선순위:

- P0 (긴급): 즉시 수정
- P1 (높음): 당일 수정
- P2 (중간): 다음 스프린트
- P3 (낮음): 백로그

---

6.  예상 소요 시간

- 사전 준비: 10분
- INT-1 실행: 60분
  - Postman 컬렉션 생성: 30분
  - 테스트 실행 및 검증: 20분
  - 결과 문서 작성: 10분
- INT-2 실행: 90분
  - 시나리오 테스트: 60분
  - 스크린샷 캡처: 15분
  - 결과 문서 작성: 15분
- 전체: 약 2.5시간

---

7.  성공 기준

INT-1 성공 조건

- 모든 API 엔드포인트 테스트 통과
- 인증 플로우 정상 작동
- 할일 CRUD 정상 작동
- 에러 케이스 적절히 처리
- 평균 응답 시간 < 1000ms
- Postman 컬렉션 저장 완료

INT-2 성공 조건

- 모든 페이지 렌더링 정상
- 인증 플로우 정상 작동
- 할일 CRUD UI 정상 작동
- 필터/정렬 기능 작동
- 캘린더/휴지통/설정 정상
- 토큰 갱신 자동화 작동
- 에러 핸들링 적절

---

핵심 파일 참조

- swagger-ko.json: API 명세 전체 참조
- backend/index.js: 라우터 마운트 구조
- frontend/src/backend/client.js: Axios 인터셉터
- frontend/src/backend/authApi.js: 인증 API
- frontend/src/backend/todoApi.js: 할일 API
- frontend/src/store/auth.store.js: 인증 상태 관리
- frontend/src/store/todo.store.js: 할일 상태 관리
