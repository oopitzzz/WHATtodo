# BE-13: 휴지통 API 구현 - 완료 보고서

**완료일**: 2025-11-27
**상태**: ✅ **완료**

---

## 📋 완료 조건 체크리스트

### 구현된 엔드포인트 (2개 모두 완료)

| # | 메서드 | 경로 | 설명 | 상태 | 파일 |
|---|--------|------|------|------|------|
| 1 | GET | `/api/trash` | 휴지통 목록 조회 (페이지네이션) | ✅ | `backend/trash/index.js:10-21` |
| 2 | DELETE | `/api/trash/:id` | 휴지통 항목 영구 삭제 | ✅ | `backend/trash/index.js:23-31` |

### 핵심 기능 요구사항

- ✅ **휴지통 조회** - deleted_at IS NOT NULL인 할일 조회
- ✅ **페이지네이션** - page, pageSize 쿼리 파라미터 지원
- ✅ **응답 형식** - {items: [], meta: {page, pageSize, total, totalPages}}
- ✅ **인증 미들웨어** - 모든 엔드포인트에 적용
- ✅ **영구 삭제** - 휴지통 항목을 DB에서 완전히 삭제 (204 No Content)
- ✅ **자동 삭제 스케줄러** - 30일 이상 경과한 항목 자동 삭제
- ✅ **DI 패턴** - 테스트에서 주입 가능

---

## 🔗 의존성 (BE-9, BE-10)

| 의존성 | 파일 | 상태 |
|--------|------|------|
| **BE-9: 할일 Repository** | `backend/_lib/repositories/todoRepository.js` | ✅ 확장 |
| **BE-10: 인증 미들웨어** | `backend/_lib/middleware/auth.js` | ✅ 사용 |

---

## 🏗️ 구현 구조

### 1. Repository 레이어 확장
파일: `backend/_lib/repositories/todoRepository.js`

```javascript
// 휴지통 조회 (페이지네이션)
getTrashedTodosByUserId(userId, options = {})
  - LIMIT/OFFSET으로 페이지네이션
  - ORDER BY deleted_at DESC

// 휴지통 개수 조회
getTrashedTodoCount(userId)
  - COUNT(*) 쿼리

// 영구 삭제 (조건 없음)
permanentlyDeleteTodoById(todoId, userId)
  - WHERE deleted_at IS NOT NULL 조건만 있음
```

### 2. Service 레이어
파일: `backend/_lib/services/trashService.js`

```javascript
// 휴지통 조회 (비즈니스 로직)
getTrash(userId, options)
  - page/pageSize를 limit/offset으로 변환
  - 응답: {items, meta: {page, pageSize, total, totalPages}}

// 영구 삭제 (에러 처리)
permanentlyDeleteTrash(userId, todoId)
  - 항목 없으면 404 TRASH_NOT_FOUND

// 자동 삭제 (스케줄러용)
autoDeleteExpiredTrash()
  - 스케줄러에서 호출하는 헬퍼
```

### 3. Router 레이어
파일: `backend/trash/index.js`

```javascript
// GET /api/trash
- 인증 미들웨어 적용
- page/pageSize 쿼리 파라미터
- 응답: {items, meta}

// DELETE /api/trash/:id
- 인증 미들웨어 적용
- 204 No Content 응답
- 에러: 404 Not Found
```

### 4. 스케줄러
파일: `backend/_lib/utils/scheduler.js`

```javascript
// 자동 삭제 실행
autoDeleteExpiredTrash()
  - 30일 이상 경과한 todos 자동 삭제
  - 로깅 및 결과 반환

// 스케줄러 시작
startAutoDeleteScheduler(intervalHours)
  - 매일 자정에 첫 실행
  - 이후 intervalHours 간격으로 반복
```

---

## 🧪 테스트 현황

### 테스트 파일 및 결과

```bash
$ cd backend && node trash/trash.test.js
✅ trash routes tests passed
✅ All 2 endpoints verified (GET /api/trash with pagination, DELETE /api/trash/:id)

$ cd backend && node _lib/services/trashService.test.js
trash service tests passed

$ cd backend && node _lib/utils/scheduler.test.js
✅ scheduler tests passed
✅ Auto delete scheduler configured (deletes todos deleted > 30 days ago)
```

### 테스트 커버리지

#### 라우터 테스트 (`backend/trash/trash.test.js`)
- ✅ GET /api/trash - 목록 조회, 페이지네이션 메타 확인
- ✅ DELETE /api/trash/:id - 204 상태코드 확인

#### 서비스 테스트 (`backend/_lib/services/trashService.test.js`)
- ✅ getTrash - 기본 페이지네이션
- ✅ getTrash - 커스텀 page/pageSize
- ✅ permanentlyDeleteTrash - 성공
- ✅ permanentlyDeleteTrash - 404 에러

#### 스케줄러 테스트 (`backend/_lib/utils/scheduler.test.js`)
- ✅ autoDeleteExpiredTrash - 동작 확인

---

## 📁 파일 목록

### 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `backend/trash/index.js` | 휴지통 라우터 (Router Factory) |
| `backend/trash/trash.test.js` | 라우터 테스트 |
| `backend/_lib/services/trashService.js` | 휴지통 서비스 |
| `backend/_lib/services/trashService.test.js` | 서비스 테스트 |
| `backend/_lib/utils/scheduler.js` | 자동 삭제 스케줄러 |
| `backend/_lib/utils/scheduler.test.js` | 스케줄러 테스트 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `backend/_lib/repositories/todoRepository.js` | getTrashedTodosByUserId, getTrashedTodoCount, permanentlyDeleteTodoById 함수 추가 |
| `backend/index.js` | trash 라우터 등록 |
| `docs/execution_plan.md` | BE-13 수행 결과 문서화 |

---

## 🔄 데이터 흐름

### GET /api/trash 흐름
```
클라이언트 요청 (page, pageSize 쿼리)
    ↓
인증 미들웨어 (req.user 설정)
    ↓
라우터 (options 파싱)
    ↓
Service.getTrash (페이지네이션 변환)
    ↓
Repository.getTrashedTodosByUserId (SELECT)
Repository.getTrashedTodoCount (COUNT)
    ↓
응답: {items: [...], meta: {...}}
```

### DELETE /api/trash/:id 흐름
```
클라이언트 요청
    ↓
인증 미들웨어 (req.user 설정)
    ↓
라우터 (todoId 추출)
    ↓
Service.permanentlyDeleteTrash (에러 처리)
    ↓
Repository.permanentlyDeleteTodoById (DELETE)
    ↓
응답: 204 No Content
```

---

## 📊 Swagger 명세 일치성

| 명세 항목 | 구현 | 확인 |
|----------|------|------|
| GET /api/trash | 목록 조회 | ✅ |
| 쿼리 파라미터 | page, pageSize | ✅ |
| 응답 형식 | {items, meta} | ✅ |
| DELETE /api/trash/{id} | 영구 삭제 | ✅ |
| 상태코드 | 204 No Content | ✅ |
| 인증 | Authorization 검증 | ✅ |

---

## 🚀 향후 고려사항

1. **실제 스케줄러 적용**
   - node-cron, node-schedule 같은 패키지 사용 권장
   - 타임존 고려

2. **로깅 개선**
   - Winston, Bunyan 같은 로깅 라이브러리 사용
   - 삭제 이력 추적

3. **배치 처리**
   - 대량 삭제 시 배치 처리 고려
   - 성능 최적화

---

## 📝 변경사항

**2025-11-27 최종 수정:**
- Repository에 3개 함수 추가
- 새로운 Service/Router/Scheduler 구현
- 3개 테스트 파일 작성 및 통과
- execution_plan.md 상세 문서화

---

**BE-13 상태: ✅ COMPLETE**

---

## 📚 관련 문서

- [BE-12 할일 API](../todos/BE-12-SUMMARY.md) - 이전 구현
- [Swagger 명세](../../swagger.json) - API 스펙 정의
- [execution_plan.md](../../docs/execution_plan.md) - 전체 계획
