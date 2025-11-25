# WHATtodo - 프로젝트 구조 설계 원칙

---

**문서 버전:** 1.1
**작성일:** 2025-11-25
**작성자:** Gemini (v1.0), Gemini as Architect Reviewer (v1.1)

---

## 1. 최상위 공통 원칙

- **단순함과 명확성 (Simplicity & Clarity):** 복잡한 설계보다 단순하고 이해하기 쉬운 구조를 지향한다. 1인 개발 및 빠른 MVP(최소 기능 제품) 제작을 위해 오버엔지니어링을 지양한다.
- **책임 분리 원칙 (Separation of Concerns):** 프론트엔드, 백엔드, 데이터베이스 등 각 계층의 역할을 명확히 분리하여 독립적으로 개발 및 배포할 수 있도록 한다.
- **PRD 기반 설계 (PRD-Driven Design):** 모든 설계 결정은 `docs/3-prd.md`에 정의된 요구사항을 최우선으로 따른다. 기능, 성능, 보안 요구사항을 충족하는 데 집중한다.
- **일관성 (Consistency):** 코드, 네이밍, 디렉토리 구조 등 프로젝트 전반에 걸쳐 일관된 패턴을 유지하여 예측 가능성을 높인다.

## 2. 의존성 및 레이어 원칙

- **단방향 의존성 (Unidirectional Dependency):** 의존성의 흐름은 항상 `프론트엔드 → 백엔드 API → 데이터베이스` 방향으로 흐른다.
  - 프론트엔드는 백엔드의 존재나 데이터베이스의 종류를 알아서는 안 되며, 오직 REST API 명세에만 의존한다.
  - 백엔드는 데이터베이스 스키마에 의존하지만, 프론트엔드의 특정 UI/UX에 의존해서는 안 된다.
- **계층 분리 (Layer Separation):**
  - **프론트엔드 (Presentation Layer):** 사용자 인터페이스와 경험(UI/UX)에 대한 책임만 가진다. 비즈니스 로직은 상태 관리 라이브러리(Zustand)와 서비스 계층으로 분리한다.
  - **백엔드 (Application/Business Layer):** 비즈니스 로직, 인증, 요청/응답 처리를 담당한다. Vercel Serverless Functions를 통해 각 API 엔드포인트가 독립적으로 작동하도록 구성한다.
  - **데이터베이스 (Data Layer):** 데이터의 영속성(Persistence)만 책임진다. Supabase PostgreSQL을 사용하며, 복잡한 비즈니스 로직을 데이터베이스 레벨(예: Stored Procedure)에 두지 않는다.

## 3. 코드 및 네이밍 원칙

- **언어 컨벤션 준수:** JavaScript (ES6+) 표준 문법과 모범 사례를 따른다.
- **코드 스타일 자동화:** **ESLint**와 **Prettier**를 설정하여 코드 컨벤션을 강제하고, 커밋 전에 자동으로 코드를 정리하도록 한다.
- **네이밍 컨벤션:**
  - **변수/함수:** `camelCase` 사용 (예: `getUserTodos`)
  - **클래스/컴포넌트:** `PascalCase` 사용 (예: `TodoItem`, `AuthService`)
  - **상수:** `UPPER_SNAKE_CASE` 사용 (예: `MAX_TODO_LIMIT`)
  - **파일:** 컴포넌트는 `PascalCase` (예: `CalendarView.jsx`), 그 외는 `kebab-case` 또는 `camelCase` (예: `api-client.js`, `authUtils.js`)를 일관되게 사용한다.
- **API 엔드포인트:** RESTful 원칙을 따른다. 리소스는 명사(복수형)로 표현하고, 행위는 HTTP 메서드로 표현한다. (예: `GET /api/todos`, `POST /api/todos`)
- **주석:** '무엇을' 보다는 '왜' 했는지를 설명하는 주석을 작성한다. 복잡한 로직이나 특별한 결정 배경을 명확히 한다.

## 4. 테스트 및 품질 원칙

- **v1.0 목표:** PRD에 명시된 바와 같이 자동화된 테스트는 제외하나, 수동 테스트를 통해 핵심 기능의 품질을 보장한다.
  - **단위 테스트:** 향후 도입을 대비해 함수는 가능한 한 순수 함수(Pure Function)로 작성한다.
  - **통합 테스트:** API 클라이언트(Postman 등)를 사용해 백엔드 API의 정합성을 검증하고, 프론트엔드와 연동하여 전체 플로우를 수동으로 테스트한다.
- **에러 핸들링:** 예상 가능한 모든 오류(API 요청 실패, 유효성 검사 실패 등)에 대해 사용자에게 명확한 피드백을 제공하는 에러 처리 로직을 반드시 구현한다.
- **표준 에러 응답:** API 실패 시, 일관된 에러 처리를 위해 다음 구조의 JSON을 반환한다: `{ "error": { "message": "에러 메시지", "code": "에러 코드" } }`
- **코드 리뷰:** 1인 개발 프로젝트이므로 셀프 코드 리뷰를 통해 잠재적 버그와 설계 개선점을 지속적으로 점검한다.

## 5. 설정, 보안, 운영 원칙

- **설정 정보 분리:** 모든 설정 정보(API 키, DB 연결 정보, JWT 시크릿 등)는 코드에 하드코딩하지 않고, 환경 변수(`.env` 파일)를 통해 관리한다.
- **프론트엔드 환경 변수:** Vite 환경에서 브라우저에 노출할 환경 변수는 반드시 `VITE_` 접두사를 사용한다. (예: `VITE_API_URL`)
- **보안 원칙 준수:**
  - **HTTPS:** Vercel 배포를 통해 모든 통신을 암호화한다.
  - **비밀번호:** `bcrypt`를 사용하여 안전하게 해시 처리한다.
  - **API 인증:** JWT(Access/Refresh Token) 방식을 엄격히 따른다.
  - **입력값 검증:** XSS, SQL Injection 방지를 위해 프론트엔드와 백엔드 양단에서 모든 사용자 입력값을 검증한다.
- **배포:** Vercel을 사용하여 프론트엔드와 백엔드(Serverless Functions)를 배포한다. `main` 브랜치에 병합 시 자동으로 배포되도록 설정하는 것을 지향한다 (v1.0 이후).

## 6. 디렉토리 구조 제안

### 6.1 프론트엔드 (React)

```
/src
├── api/                # API 호출 서비스 (Axios 인스턴스, 엔드포인트별 함수)
│   └── index.js
├── assets/             # 이미지, 폰트, CSS 등 정적 파일
├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 범용 컴포넌트 (Button, Input, Modal 등)
│   └── domain/         # 도메인 특화 컴포넌트 (TodoItem, CalendarDay 등)
├── constants/          # 프로젝트 전역 상수
├── hooks/              # 커스텀 훅
├── layouts/            # 페이지 레이아웃 컴포넌트
├── pages/              # 라우팅 단위의 페이지 컴포넌트
├── store/              # 상태 관리 (Zustand). 도메인별로 스토어(slice)를 분리한다. (예: user.store.js)
├── styles/             # 전역 스타일 (tailwind.css 등)
├── utils/              # 순수 함수 유틸리티
└── App.jsx             # 최상위 애플리케이션 컴포넌트
└── main.jsx            # 애플리케이션 진입점
```

### 6.2 백엔드 (Node.js/Express on Vercel)

Vercel Serverless Functions 환경에 맞춰 `api` 디렉토리 기반으로 구조를 설계한다.

```
/api
├── auth/               # 인증 관련 API
│   ├── login.js
│   ├── signup.js
│   └── refresh.js
├── todos/              # 할일 관련 API
│   ├── index.js        # GET /api/todos, POST /api/todos
│   └── [id].js         # GET, PUT, DELETE /api/todos/:id
├── users/              # 사용자 관련 API
│   └── me.js
├── _lib/               # API 간에 공유되는 내부 모듈 (Vercel 규칙)
│   ├── db.js           # 데이터베이스 연결 및 쿼리 헬퍼
│   ├── middleware.js   # 인증 등 공통 미들웨어
│   └── utils.js        # 공통 유틸리티 함수
└── index.js            # 루트 엔드포인트 (헬스 체크용)
```
**참고: 함수 내 로직 분리:** 각 API 파일 내에서는 요청/응답 처리(Controller), 비즈니스 로직(Service), 데이터 접근(Data Access)의 역할을 각각의 함수로 분리하여 가독성과 테스트 용이성을 높인다.
