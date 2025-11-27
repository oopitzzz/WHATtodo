# CLAUDE_ko.md

이 문서는 이 저장소에서 코드를 다룰 때 Claude Code(claude.ai/code)를 위한 지침을 한글로 제공합니다.

## 프로젝트 개요

**WHATtodo**는 Node.js/Express 백엔드와 PostgreSQL 데이터베이스를 사용하는 인증 기반 투두 관리 애플리케이션입니다.

- **목적**: 사용자 인증, 휴지통/복원, 캘린더 연동이 포함된 투두 관리
- **기술 스택**:
  - 백엔드: Node.js + Express 5.x
  - 데이터베이스: PostgreSQL (Supabase)
  - 인증: JWT + bcrypt
  - 테스트: Jest + Supertest
  - 프론트엔드: OpenAPI 모크 서버(개발 중)

## 아키텍처 개요

### 백엔드 구조

```
backend/
├── index.js                 # Express 앱 엔트리 포인트
├── _lib/                    # 공통 유틸리티·미들웨어
│   ├── db.js                # PostgreSQL 커넥션 풀
│   ├── middleware/          # Express 미들웨어(auth, CORS, logger, error)
│   ├── repositories/        # 데이터 접근 레이어 (userRepository, todoRepository 등)
│   ├── services/            # 비즈니스 로직 레이어 (authService, todoService 등)
│   └── utils/               # 유틸리티(bcrypt, JWT, scheduler)
├── auth/                    # 인증 엔드포인트(signup, login, logout, refresh)
├── todos/                   # 투두 CRUD 라우트
├── trash/                   # 휴지통/복원 라우트
├── users/                   # 사용자 프로필 라우트
├── calendar/                # 캘린더 관련 라우트
└── node_modules/
```

### 핵심 아키텍처 패턴

1. **3-레이어 아키텍처**
   - **Routes** (`auth/`, `todos/` 등): HTTP 요청/응답 처리
   - **Services** (`_lib/services/`): 비즈니스 로직·검증
   - **Repositories** (`_lib/repositories/`): DB 접근(도메인별 1개 리포지토리)

2. **미들웨어 파이프라인**
   - 전역 CORS 적용
   - JSON body 파싱
   - 요청 로거 미들웨어
   - 보호 라우트의 인증 미들웨어
   - 마지막에 에러 핸들러

3. **데이터베이스 접근**
   - 모든 쿼리는 리포지토리를 거침
   - 리포지토리는 `_lib/db.js`의 PostgreSQL 풀을 사용
   - 서비스 → 리포지토리 → DB 흐름

4. **에러 처리**
   - 모든 라우트 핸들러는 async try/catch
   - `next()`로 전달해 중앙 에러 핸들러에서 처리
   - HTTP 상태코드에 맞춰 응답, 로깅 수행

### 테스트 아키텍처

- 단위 테스트: 서비스/유틸(`*.test.js`)
- 통합 테스트: 요청/응답 흐름(`integration.test.js`)
- Jest + Supertest 사용
- 리포지토리는 `__setRepository()`로 목킹 가능(`todoService.test.js` 참고)

## 개발 명령

### 백엔드

```bash
cd backend

# 개발(자동 리로드)
npm run dev

# 프로덕션
npm start

# 전체 테스트
npm test

# 특정 테스트 파일
npm test -- todos.test.js

# 이름 패턴 매칭 테스트
npm test -- --testNamePattern="should create"
```

### 프론트엔드

```bash
cd frontend

# 개발(OpenAPI 모크 서버)
npm run dev

# 프로덕션
npm start
```

## 핵심 구현 패턴

### 새 서비스 생성

1. `_lib/services/featureService.js`에 비즈니스 로직 작성
2. 의존성 주입 패턴 사용: 리포지토리를 인자로 받아 설정
3. `featureService.test.js`에 단위 테스트 추가
4. 대응 리포지토리를 `_lib/repositories/`에 생성

예시(`todoService.js`):
```javascript
let todoRepository = require('../repositories/todoRepository');

function setRepository(repo) {
  todoRepository = repo;
}

async function createTodo(userId, { title, dueDate }) {
  // validation
  // call repository
  // return result
}

module.exports = {
  createTodo,
  getTodos,
  __setRepository: setRepository
};
```

### 새 라우트 생성

1. 의존성 주입을 받는 라우트 빌더 함수 작성
2. 서비스/미들웨어의 기본 익스포트를 사용
3. 빌더와 기본 라우터 둘 다 export

예시(`todos/index.js`):
```javascript
function buildTodoRouter({ authMiddleware = defaultAuthMiddleware, todoService = defaultTodoService } = {}) {
  const router = express.Router();
  router.use(authMiddleware);

  router.get('/', async (req, res, next) => {
    try {
      const todos = await todoService.getTodos(req.user.userId, filters);
      res.json({ data: todos });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = buildTodoRouter;
module.exports.default = buildTodoRouter();
```

### 데이터베이스 연결

모든 DB 작업은 `_lib/db.js`의 풀을 사용:
```javascript
const { pool } = require('../_lib/db');
const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [userId]);
```

## 테스트 가이드라인

- 모든 테스트에 Jest 사용
- 외부 의존성(리포지토리, 서비스) 목킹
- HTTP 엔드포인트는 Supertest 사용
- 에러 케이스·검증 로직 테스트
- 테스트 이름은 서술형: "should create todo with valid title"

예시 구조:
```javascript
describe('todoService.createTodo', () => {
  it('should create todo with valid title', async () => {
    const mockRepo = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    todoService.__setRepository(mockRepo);
    const result = await todoService.createTodo(1, { title: 'Test' });
    expect(result.id).toBe(1);
  });
});
```

## API 엔드포인트

### Authentication
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - JWT 리프레시

### Todos
- `GET /api/todos` - 사용자 투두 목록(필터/페이지네이션)
- `POST /api/todos` - 투두 생성
- `GET /api/todos/:id` - 특정 투두 조회
- `PUT /api/todos/:id` - 투두 수정
- `PATCH /api/todos/:id/complete` - 완료 처리
- `PATCH /api/todos/:id/restore` - 삭제 복원
- `DELETE /api/todos/:id` - 삭제

### Other
- `GET /api/trash` - 삭제된 투두 조회
- `GET /api/users` - 사용자 프로필 조회
- `GET /api/calendar` - 캘린더 관련
- `GET /api/docs` - Swagger API 문서

## 주요 파일과 역할

| File | Purpose |
|------|---------|
| `backend/_lib/db.js` | PostgreSQL 커넥션 풀 설정 |
| `backend/_lib/middleware/auth.js` | JWT 검증 미들웨어 |
| `backend/_lib/services/authService.js` | 회원가입/로그인 로직 |
| `backend/_lib/services/todoService.js` | 투두 CRUD 비즈니스 로직 |
| `backend/_lib/repositories/todoRepository.js` | 투두 DB 쿼리 |
| `backend/index.js` | Express 앱 설정 및 라우트 마운트 |

## 환경 변수

`.env`에 필요한 값:
- `POSTGRES_CONNECTION_STRING` - PostgreSQL 연결 URI
- `PORT` - 서버 포트(기본 3000)
- `JWT_SECRET` - JWT 서명 시크릿
- `NODE_ENV` - development 또는 production

`.env`는 gitignore 처리되어 커밋되지 않아야 합니다.

## 최근 구현 사항 (BE-12, BE-13, BE-14, BE-15)

- **BE-12**: 투두 API CRUD 및 완료/복원/삭제 기능
- **BE-13**: 휴지통 API (삭제 투두 관리)
- **BE-14**: 사용자 프로필 엔드포인트
- **BE-15**: 공휴일 API 연동 캘린더 기능

자세한 진행 상황은 `docs/execution_plan.md`를 참고하세요.

## 추후 개발 노트

1. 모든 신규 코드는 3-레이어 패턴(라우트 → 서비스 → 리포지토리)을 따를 것
2. 테스트 용이성을 위해 의존성 주입 사용
3. async 라우트 핸들러는 try/catch로 감싸고 next()로 에러 전달
4. 새로운 서비스나 주요 라우트 로직에는 테스트를 추가
5. 입력 검증을 라우트 또는 서비스 레벨에서 일관되게 수행
6. 새 API 엔드포인트는 Swagger 스펙(`swagger-ko.json`)에 문서화
