# INT-1/INT-2 통합 테스트 실행 가이드 (total-test-plan 기반)

## 목적
- `docs/execution_plan.md`의 통합 계획 중 INT-1(백엔드·DB 통합 테스트)와 INT-2(프론트엔드·백엔드 통합 테스트)를 수행하기 위한 절차/체크리스트를 정리했습니다.
- 기준 문서: `docs/total-test-plan.md` (Postman 컬렉션/수동 시나리오·산출물 경로 등)

## 선행 조건·블로커
- FE 코드 상태: 다수 한글 문자열 깨짐 및 JSX 미닫힘으로 현재 빌드 불가. 테스트 전에 다음을 정리해야 합니다.
  - LoginForm/SignupForm/TodoForm/LoginPage/SignupPage/DashboardPage/CalendarPage의 깨진 문자열 및 따옴표 오류 수정.
  - todo.store의 `sortDirection`을 소문자(`asc|desc`)로 전송하도록 조정.
  - TodoForm에서 마감일 필드를 백엔드 기대(`dueDate`)로 맞춤.
- 환경 변수
  - backend `.env`: `POSTGRES_CONNECTION_STRING`, `JWT_SECRET`, `PORT=3000`, `NODE_ENV=development`
  - frontend `.env`: `VITE_API_BASE_URL=http://localhost:3000/api`
- 서버 기동: `npm run dev` (backend), `npm run dev` (frontend, 빌드 오류 해소 후)
- 테스트 도구: Postman(WHATtodo API Integration Tests 컬렉션), 브라우저 수동 테스트.

## INT-1: 백엔드-DB 통합 테스트 (Postman)
`docs/total-test-plan.md` 2장 기준.

1) Health
- GET `/health` → 200 OK

2) 인증 플로우
- POST `/api/auth/signup` → 201, access/refresh 토큰, env 변수 저장
- POST `/api/auth/login` → 200, 토큰 재발급
- POST `/api/auth/refresh` → 200, 새 access/refresh
- POST `/api/auth/logout` → 200

3) Todos CRUD
- POST `/api/todos` Body `{title, priority, dueDate}` → 201, todoId 저장
- GET `/api/todos` → 200, 목록 포함
- GET `/api/todos/{id}` → 200 단일
- PUT `/api/todos/{id}` (title/priority/dueDate/memo) → 200
- PATCH `/api/todos/{id}/complete` → 200, status COMPLETED, completed_at 존재
- PATCH `/api/todos/{id}/restore` → 200, status 복원
- DELETE `/api/todos/{id}` → 200, status DELETED, deleted_at 존재

4) 필터·정렬
- GET `/api/todos?status=ACTIVE&sortBy=due_date&sortDirection=asc&search=...`
- 기대: 필터 반영, 정렬 순서 일관

5) Trash
- GET `/api/trash?page=1&pageSize=20` → 200, meta.totalPages 존재
- DELETE `/api/trash/{id}` (30일 지난 항목) → 204

6) User Profile
- GET `/api/users/me` → 200
- PUT `/api/users/me` (nickname/profileImageUrl/notificationEnabled) → 200, 반영 확인

7) Calendar
- GET `/api/calendar/holidays?year=2025&month=12` → 200, 공휴일 배열

8) 에러 케이스
- 400: 잘못된 입력(빈 title, 잘못된 dueDate)
- 401: 토큰 없음/만료
- 404: 존재하지 않는 todoId
- 409: 중복 이메일

9) 성능
- 각 API 응답 1000ms 이하(로컬 기준)

## INT-2: 프론트엔드-백엔드 통합 테스트 (수동)
`docs/total-test-plan.md` 3장 기준. FE 빌드 정상화 후 진행.

1) 인증 화면
- 회원가입 → 자동 로그인 → 대시보드 이동
- 로그인 → 성공 시 대시보드, 실패 시 에러 메시지
- 이미 로그인 상태로 /login 접근 시 리다이렉트 확인

2) 대시보드/Todo 기본 흐름
- Todo 생성(제목/우선순위/마감일) → 목록 즉시 반영
- 상세 보기/수정 → 변경 즉시 반영
- 완료 처리 체크박스 → 상태/완료일 표시
- 삭제(soft delete) → 목록에서 제거, Trash에 표시
- 필터(status), 정렬(sortBy, sortDirection), 검색 동작 확인

3) Trash
- 휴지통 목록 로드 → meta 정보 확인
- 복원 → 대시보드에 복귀
- 영구 삭제 → 휴지통에서 제거

4) 캘린더
- 월 전환/Today 동작
- 공휴일 표시(backend API 연동)
- 날짜 클릭 시 해당 날짜 todo 필터(또는 로그 출력이라도 확인)

5) 설정
- 프로필 닉네임/알림 토글 수정 → 저장 후 재로딩 시 반영
- 로그아웃 → 로컬 스토리지 토큰 삭제, /login 이동

6) 토큰 자동 재발급
- accessToken 만료 상황 흉내(오래된 토큰 저장) → 첫 요청 시 refresh 후 재시도되는지 확인
- refresh 실패 시 로그인 페이지로 이동하는지 확인

7) 장애/오프라인 대응
- 백엔드 중단 후 요청 → 에러 메시지/로딩 상태 처리 확인
- 잘못된 입력 시 폼 에러 표시 확인

## 산출물 작성 위치
- INT-1 결과: `docs/INT-1-backend-test-results.md` (existing 경로 권장)
- INT-2 결과: `docs/INT-2-frontend-test-results.md`
- 스크린샷: `docs/screenshots/int-2/` (total-test-plan 기준)
- 체크박스: `docs/execution_plan.md` 내 INT-1/INT-2 항목 업데이트

## 위험·조치 요약
- FE 문자열/문법 오류를 우선 수정해야 통합 테스트 가능.
- 마감일 필드명(`dueDate`) 및 정렬 파라미터(`asc|desc`)를 백엔드 기대와 일치시켜야 기능/테스트가 정상 동작.
- 위 블로커 해결 후 total-test-plan 시나리오대로 Postman/수동 테스트를 수행하고 결과 파일에 기록.
