# WHATtodo 기술 아키텍처 다이어그램

---

**문서 버전:** 1.0
**작성일:** 2025-11-26
**프로젝트명:** WHATtodo

---

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [계층별 구조](#2-계층별-구조)
3. [데이터 플로우](#3-데이터-플로우)
4. [인증 플로우](#4-인증-플로우)
5. [배포 아키텍처](#5-배포-아키텍처)
6. [데이터베이스 구조](#6-데이터베이스-구조)

---

## 1. 시스템 아키텍처 개요

### 1.1 전체 시스템 구조

```mermaid
graph TB
    User[사용자] -->|HTTPS| Browser[웹 브라우저]
    Browser -->|SPA| React[React App<br/>Vite + Zustand]
    React -->|REST API| API[Vercel Serverless<br/>Node.js + Express]
    API -->|SQL| DB[(PostgreSQL<br/>Supabase)]

    style User fill:#e1f5ff
    style React fill:#61dafb
    style API fill:#68a063
    style DB fill:#336791
```

**계층 설명:**
- **프론트엔드**: React + Vite + Zustand + Tailwind CSS
- **백엔드**: Node.js + Express (Vercel Serverless Functions)
- **데이터베이스**: PostgreSQL (Supabase)
- **통신**: REST API over HTTPS
- **인증**: JWT (Access Token + Refresh Token)

---

## 2. 계층별 구조

### 2.1 3계층 아키텍처

```mermaid
graph LR
    subgraph Presentation["Presentation Layer"]
        UI[UI Components]
        Store[Zustand Store]
        ApiClient[API Client]
    end

    subgraph Application["Application Layer"]
        Controller[API Handler]
        Service[Business Logic]
        Repository[Data Access]
    end

    subgraph Data["Data Layer"]
        Database[(PostgreSQL)]
    end

    UI --> Store
    Store --> ApiClient
    ApiClient -->|HTTP/HTTPS| Controller
    Controller --> Service
    Service --> Repository
    Repository -->|SQL| Database

    style Presentation fill:#e3f2fd
    style Application fill:#fff3e0
    style Data fill:#f3e5f5
```

**책임 분리:**
- **Presentation**: UI 렌더링, 상태 관리, API 호출
- **Application**: 비즈니스 로직, 인증/인가, 데이터 검증
- **Data**: 데이터 영속성, 쿼리 실행, 무결성 보장

### 2.2 프론트엔드 구조

```mermaid
graph TD
    Pages[Pages] --> Layouts[Layouts]
    Layouts --> DomainComp[Domain Components]
    DomainComp --> CommonComp[Common Components]

    Pages --> Store[Zustand Store]
    Store --> API[API Services]

    Store --> AuthStore[auth.store.js]
    Store --> TodoStore[todo.store.js]
    Store --> UIStore[ui.store.js]

    API --> AuthAPI[authApi.js]
    API --> TodoAPI[todoApi.js]
    API --> UserAPI[userApi.js]

    style Pages fill:#bbdefb
    style Store fill:#c8e6c9
    style API fill:#fff9c4
```

**디렉토리 구조:**
- `/pages` - 라우트 컴포넌트
- `/components/domain` - 도메인 특화 컴포넌트
- `/components/common` - 재사용 가능한 UI
- `/store` - Zustand 상태 관리
- `/api` - API 통신 계층

### 2.3 백엔드 구조

```mermaid
graph TD
    Request[HTTP Request] --> Handler[API Handler]
    Handler --> AuthMW[Auth Middleware]
    AuthMW --> Service[Service Layer]
    Service --> Repo[Repository Layer]
    Repo --> DB[(Database)]

    Service --> TodoService[todoService.js]
    Service --> AuthService[authService.js]
    Service --> NotifService[notificationService.js]

    Repo --> TodoRepo[todoRepository.js]
    Repo --> UserRepo[userRepository.js]

    style Handler fill:#ffccbc
    style Service fill:#c5e1a5
    style Repo fill:#b3e5fc
    style DB fill:#d1c4e9
```

**Vercel Serverless 구조:**
- `/api/auth` - 인증 API
- `/api/todos` - 할일 API
- `/api/users` - 사용자 API
- `/api/_lib` - 공유 모듈 (서비스, 리포지토리, 미들웨어)

---

## 3. 데이터 플로우

### 3.1 할일 생성 플로우

```mermaid
sequenceDiagram
    actor User as 사용자
    participant UI as TodoForm
    participant Store as todo.store.js
    participant API as todoApi.js
    participant Backend as API Handler
    participant Service as todoService
    participant DB as PostgreSQL

    User->>UI: 할일 입력 및 제출
    UI->>UI: 클라이언트 유효성 검사
    UI->>Store: createTodo(data)
    Store->>API: POST /api/todos
    Note over API: Authorization: Bearer token
    API->>Backend: HTTP Request
    Backend->>Backend: JWT 토큰 검증
    Backend->>Service: 비즈니스 로직 실행
    Service->>DB: INSERT INTO todos
    DB-->>Service: todo_id
    Service->>Service: 알림 생성 (D-1, D-day)
    Service-->>Backend: 생성된 할일
    Backend-->>API: 201 Created
    API-->>Store: 응답 데이터
    Store->>Store: 상태 업데이트
    Store-->>UI: 리렌더링
    UI-->>User: 할일 목록에 표시
```

### 3.2 할일 조회 플로우

```mermaid
sequenceDiagram
    participant UI as TodoList
    participant Store as todo.store.js
    participant API as todoApi.js
    participant Backend as API Handler
    participant Repo as todoRepository
    participant DB as PostgreSQL

    UI->>Store: fetchTodos()
    Store->>API: GET /api/todos
    API->>Backend: HTTP Request + JWT
    Backend->>Backend: 토큰 검증 및 user_id 추출
    Backend->>Repo: findTodosByUserId(userId)
    Repo->>DB: SELECT * FROM todos WHERE user_id = ?
    DB-->>Repo: 할일 목록
    Repo-->>Backend: 데이터 반환
    Backend-->>API: 200 OK + todos
    API-->>Store: 응답 파싱
    Store->>Store: 상태 저장
    Store-->>UI: 리렌더링
```

---

## 4. 인증 플로우

### 4.1 로그인 및 토큰 발급

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as LoginForm
    participant API as authApi.js
    participant Backend as /api/auth/login
    participant DB as PostgreSQL

    User->>UI: 이메일/비밀번호 입력
    UI->>API: POST /api/auth/login
    API->>Backend: { email, password }
    Backend->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Backend: user 정보
    Backend->>Backend: bcrypt 비밀번호 검증
    Backend->>Backend: JWT Access Token 생성 (15분)
    Backend->>Backend: JWT Refresh Token 생성 (7일)
    Backend-->>API: { accessToken, refreshToken, user }
    API->>API: LocalStorage 저장
    API-->>UI: 로그인 성공
    UI-->>User: 대시보드로 이동
```

### 4.2 토큰 갱신 플로우

```mermaid
sequenceDiagram
    participant UI as Component
    participant Interceptor as Axios Interceptor
    participant Refresh as /api/auth/refresh
    participant API as Original API

    UI->>API: API 요청 (만료된 토큰)
    API-->>UI: 401 Unauthorized
    UI->>Interceptor: 에러 감지
    Interceptor->>Refresh: POST /api/auth/refresh
    Note over Refresh: Refresh Token 전송
    Refresh->>Refresh: Refresh Token 검증
    Refresh-->>Interceptor: 새 Access Token
    Interceptor->>Interceptor: LocalStorage 업데이트
    Interceptor->>API: 원래 요청 재시도 (새 토큰)
    API-->>UI: 200 OK
```

---

## 5. 배포 아키텍처

### 5.1 Vercel 배포 구조

```mermaid
graph TB
    subgraph Internet
        User[사용자]
    end

    subgraph Vercel["Vercel Platform"]
        CDN[Edge Network CDN]

        subgraph Frontend["Frontend (Static)"]
            ReactApp[React SPA<br/>Build Output]
            Assets[Static Assets]
        end

        subgraph Backend["Serverless Functions"]
            AuthFunc[/api/auth/*]
            TodoFunc[/api/todos/*]
            UserFunc[/api/users/*]
        end

        EnvVars[Environment Variables]
    end

    subgraph Supabase["Supabase Cloud"]
        PostgreSQL[(PostgreSQL)]
        Backup[Daily Backup]
    end

    User -->|HTTPS| CDN
    CDN --> ReactApp
    CDN --> Assets
    ReactApp -->|API Calls| AuthFunc
    ReactApp -->|API Calls| TodoFunc
    ReactApp -->|API Calls| UserFunc

    AuthFunc --> EnvVars
    TodoFunc --> EnvVars
    UserFunc --> EnvVars

    AuthFunc -->|Connection Pool| PostgreSQL
    TodoFunc -->|Connection Pool| PostgreSQL
    UserFunc -->|Connection Pool| PostgreSQL

    PostgreSQL --> Backup

    style CDN fill:#000000,color:#ffffff
    style ReactApp fill:#61dafb
    style PostgreSQL fill:#336791
    style EnvVars fill:#ffd54f
```

**배포 프로세스:**
1. 로컬에서 개발 및 테스트
2. Git commit & push to GitHub
3. Vercel 자동 빌드 및 배포
4. Edge Network CDN을 통한 전 세계 배포

**환경 변수:**
- **프론트엔드**: `VITE_API_URL`, `VITE_ENV`
- **백엔드**: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`

---

## 6. 데이터베이스 구조

### 6.1 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ TODO : creates
    USER ||--o{ NOTIFICATION : receives
    TODO ||--o{ NOTIFICATION : triggers

    USER {
        int user_id PK
        string email UK
        string password_hash
        string nickname
        string profile_image_url
        timestamp created_at
        timestamp updated_at
    }

    TODO {
        int todo_id PK
        int user_id FK
        string title
        text description
        enum priority
        enum status
        date due_date
        text memo
        timestamp completed_at
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATION {
        int notification_id PK
        int user_id FK
        int todo_id FK
        enum type
        string message
        timestamp scheduled_at
        boolean is_sent
        timestamp created_at
    }

    CALENDAR {
        int holiday_id PK
        date date UK
        string name
        string description
        timestamp created_at
    }
```

### 6.2 주요 인덱스

```mermaid
graph LR
    subgraph "todos 테이블 인덱스"
        idx1[idx_todos_user_id<br/>user_id]
        idx2[idx_todos_due_date<br/>due_date]
        idx3[idx_todos_status<br/>status]
        idx4[idx_todos_user_status<br/>user_id, status]
    end

    subgraph "notifications 테이블 인덱스"
        idx5[idx_notif_user_id<br/>user_id]
        idx6[idx_notif_scheduled<br/>scheduled_at, is_sent]
    end

    subgraph "users 테이블 인덱스"
        idx7[idx_users_email<br/>email UNIQUE]
    end

    style idx1 fill:#c8e6c9
    style idx2 fill:#c8e6c9
    style idx3 fill:#c8e6c9
    style idx4 fill:#ffccbc
    style idx5 fill:#c8e6c9
    style idx6 fill:#c8e6c9
    style idx7 fill:#fff9c4
```

**인덱스 전략:**
- **단일 인덱스**: 자주 조회되는 단일 컬럼 (user_id, due_date, status)
- **복합 인덱스**: 함께 조회되는 컬럼 조합 (user_id + status)
- **유니크 인덱스**: 중복 방지 (email)

---

## 7. 보안 아키텍처

### 7.1 다층 보안 구조

```mermaid
graph TB
    subgraph Layer1["Client Layer"]
        HTTPS[HTTPS 통신]
        XSS[XSS 방지<br/>입력값 이스케이프]
        CSRF[CSRF 방지<br/>토큰 기반 인증]
    end

    subgraph Layer2["Network Layer"]
        Vercel[Vercel SSL]
        CORS[CORS 정책<br/>허용 도메인만]
        RateLimit[Rate Limiting<br/>분당 100회]
    end

    subgraph Layer3["Application Layer"]
        JWT[JWT 검증]
        Validation[입력값 검증]
        BCrypt[bcrypt 해싱]
    end

    subgraph Layer4["Data Layer"]
        PreparedStmt[Prepared Statement<br/>SQL Injection 방지]
        Encryption[데이터 암호화]
        Backup[Daily Backup]
    end

    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4

    style Layer1 fill:#ffebee
    style Layer2 fill:#fff3e0
    style Layer3 fill:#e8f5e9
    style Layer4 fill:#e3f2fd
```

**보안 원칙:**
1. **통신 보안**: 모든 통신 HTTPS 암호화
2. **인증 보안**: JWT Access/Refresh Token, bcrypt 해싱
3. **입력값 검증**: 프론트엔드 + 백엔드 양단 검증
4. **데이터 보안**: Prepared Statement, 민감정보 암호화

---

## 8. 성능 최적화 전략

### 8.1 프론트엔드 최적화

```mermaid
graph LR
    subgraph Optimization["Frontend Optimization"]
        CodeSplit[Code Splitting<br/>React.lazy]
        Memo[Memoization<br/>React.memo, useMemo]
        Debounce[Debounce/Throttle<br/>검색, 스크롤]
        Cache[API Caching<br/>5분 캐시]
        LazyLoad[Image Lazy Loading]
    end

    CodeSplit --> FasterLoad[빠른 초기 로딩]
    Memo --> LessRerender[리렌더링 감소]
    Debounce --> LessAPI[API 호출 감소]
    Cache --> FasterResponse[빠른 응답]
    LazyLoad --> LessBandwidth[대역폭 절약]

    style Optimization fill:#e8eaf6
    style FasterLoad fill:#c5e1a5
    style LessRerender fill:#c5e1a5
    style LessAPI fill:#c5e1a5
    style FasterResponse fill:#c5e1a5
    style LessBandwidth fill:#c5e1a5
```

### 8.2 백엔드 최적화

```mermaid
graph LR
    subgraph Backend["Backend Optimization"]
        Index[Database Indexes<br/>user_id, status]
        Pool[Connection Pooling<br/>최대 20개]
        Async[비동기 처리<br/>Promise.all]
        MinDep[의존성 최소화<br/>Cold Start 감소]
    end

    Index --> FasterQuery[빠른 쿼리<br/>100ms 이내]
    Pool --> EfficientDB[효율적 DB 연결]
    Async --> Parallel[병렬 처리]
    MinDep --> QuickStart[빠른 함수 시작]

    style Backend fill:#fff8e1
    style FasterQuery fill:#80deea
    style EfficientDB fill:#80deea
    style Parallel fill:#80deea
    style QuickStart fill:#80deea
```

---

## 9. 아키텍처 결정 기록 (ADR)

### 9.1 주요 기술 선택 이유

| 기술 | 선택 이유 |
|-----|----------|
| **React** | 컴포넌트 기반 개발, 풍부한 생태계, 빠른 개발 속도 |
| **Vite** | 빠른 빌드, HMR, 최신 도구 |
| **Zustand** | 간단한 상태 관리, Redux보다 가벼움, 보일러플레이트 최소 |
| **Vercel Serverless** | 자동 스케일링, 배포 간편, 무료 티어, Cold Start 최적화 |
| **PostgreSQL (Supabase)** | 관계형 데이터, 무료 호스팅, 백업 자동화 |
| **JWT** | Stateless 인증, Serverless 환경 최적, 확장성 |

### 9.2 오버엔지니어링 회피 결정

**제외한 기술/패턴:**
- ❌ GraphQL → REST API로 충분 (MVP 단계)
- ❌ Redis 캐싱 → Vercel Edge Caching + 클라이언트 캐싱으로 충분
- ❌ 마이크로서비스 → 모놀리식 Serverless로 단순화
- ❌ TypeScript → JavaScript로 빠른 개발 (v1.1에서 도입 검토)
- ❌ 복잡한 상태 관리 (Redux Saga) → Zustand로 충분

---

## 문서 요약

이 아키텍처 다이어그램은 WHATtodo 프로젝트의 기술 구조를 시각화합니다.

**핵심 아키텍처:**
- 3계층 구조 (Presentation - Application - Data)
- 단방향 의존성 (Frontend → API → Database)
- Stateless Serverless 설계
- JWT 기반 인증
- HTTPS 보안 통신

**기술 스택:**
- Frontend: React + Vite + Zustand + Tailwind CSS
- Backend: Node.js + Express on Vercel Serverless
- Database: PostgreSQL on Supabase
- Deployment: Vercel (Frontend + Backend)

**설계 원칙:**
- 단순함 우선 (오버엔지니어링 금지)
- 보안 우선 (다층 보안)
- 성능 최적화 (캐싱, 인덱싱, 코드 스플리팅)
- 확장 가능성 (v1.1 이후 점진적 개선)

---

**문서 버전:** 1.0
**마지막 업데이트:** 2025-11-26
