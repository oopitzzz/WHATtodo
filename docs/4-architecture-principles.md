# WHATtodo - 프로젝트 구조 설계 원칙

---

**문서 버전:** 2.0
**작성일:** 2025-11-26
**작성자:** Gemini (v1.0), Gemini as Architect Reviewer (v1.1), Enhanced Guide (v2.0)

---

## 목차

1. [최상위 공통 원칙](#1-최상위-공통-원칙)
2. [의존성 및 레이어 원칙](#2-의존성-및-레이어-원칙)
3. [계층별 상세 가이드](#3-계층별-상세-가이드)
4. [코드 및 네이밍 원칙](#4-코드-및-네이밍-원칙)
5. [테스트 및 품질 원칙](#5-테스트-및-품질-원칙)
6. [설정, 보안, 운영 원칙](#6-설정-보안-운영-원칙)
7. [디렉토리 구조 상세 설명](#7-디렉토리-구조-상세-설명)
8. [데이터 플로우 및 시퀀스](#8-데이터-플로우-및-시퀀스)
9. [성능 최적화 가이드](#9-성능-최적화-가이드)
10. [개발 체크리스트](#10-개발-체크리스트)

---

## 1. 최상위 공통 원칙

### 1.1 핵심 설계 철학

- **단순함과 명확성 (Simplicity & Clarity):** 복잡한 설계보다 단순하고 이해하기 쉬운 구조를 지향한다. 1인 개발 및 빠른 MVP(최소 기능 제품) 제작을 위해 오버엔지니어링을 지양한다.

  - 기능 하나당 하나의 책임만 부여
  - 추상화는 필요한 만큼만 적용
  - 코드 가독성을 최우선으로 고려

- **책임 분리 원칙 (Separation of Concerns):** 프론트엔드, 백엔드, 데이터베이스 등 각 계층의 역할을 명확히 분리하여 독립적으로 개발 및 배포할 수 있도록 한다.

  - 각 계층은 독립적으로 테스트 가능해야 함
  - 한 계층의 변경이 다른 계층에 최소한의 영향을 미치도록 설계
  - 인터페이스를 통한 계층 간 통신

- **PRD 기반 설계 (PRD-Driven Design):** 모든 설계 결정은 `docs/3-prd.md`에 정의된 요구사항을 최우선으로 따른다. 기능, 성능, 보안 요구사항을 충족하는 데 집중한다.

  - 요구사항에 명시되지 않은 기능은 v1.0에 포함하지 않음
  - 비기능 요구사항(성능, 보안)을 설계 단계부터 고려
  - 기능 우선순위(Must Have > Should Have > Could Have)를 엄격히 준수

- **일관성 (Consistency):** 코드, 네이밍, 디렉토리 구조 등 프로젝트 전반에 걸쳐 일관된 패턴을 유지하여 예측 가능성을 높인다.
  - 동일한 목적의 코드는 동일한 패턴으로 작성
  - 프로젝트 전체에서 하나의 코딩 스타일 적용
  - 예외는 최소화하고 명확한 이유가 있을 때만 허용

### 1.2 설계 우선순위

1. **정확성 (Correctness)** - 기능이 요구사항대로 동작해야 함
2. **보안 (Security)** - 사용자 데이터와 시스템을 안전하게 보호
3. **성능 (Performance)** - PRD에 명시된 성능 요구사항 충족
4. **유지보수성 (Maintainability)** - 코드 수정 및 확장이 용이
5. **확장성 (Scalability)** - 향후 기능 추가 대비 (v1.1 이후)

## 2. 의존성 및 레이어 원칙

### 2.1 단방향 의존성 (Unidirectional Dependency)

의존성의 흐름은 항상 다음 방향으로 흐른다:

```
사용자 → UI 컴포넌트 → 상태 관리 → API 서비스 → REST API → 비즈니스 로직 → 데이터베이스
```

**핵심 규칙:**

1. **프론트엔드 의존성**

   - 프론트엔드는 REST API 명세에만 의존
   - 백엔드의 구현 기술(Node.js, Express 등)을 알아서는 안 됨
   - 데이터베이스의 존재나 종류(PostgreSQL)를 알아서는 안 됨
   - 프론트엔드 환경 변수에는 API URL만 포함

2. **백엔드 의존성**

   - 백엔드는 데이터베이스 스키마에 의존
   - 프론트엔드의 특정 UI/UX 구현 방식에 의존해서는 안 됨
   - API는 클라이언트 종류(웹, 모바일 등)에 무관하게 동작

3. **데이터베이스 의존성**
   - 데이터베이스는 순수 데이터 저장소로 동작
   - 비즈니스 로직을 포함하지 않음
   - 데이터 무결성 제약 조건만 관리

**의존성 규칙 위반 예시:**

❌ **잘못된 패턴**

- 프론트엔드에서 Supabase 클라이언트로 직접 DB 접근
- 백엔드 API가 프론트엔드의 Zustand 스토어 구조에 맞춰 설계됨
- Stored Procedure에 할일 생성 로직 포함
- 프론트엔드 컴포넌트에서 JWT 토큰 생성

✅ **올바른 패턴**

- 프론트엔드는 항상 REST API를 통해서만 데이터 접근
- 백엔드 API는 표준 JSON 형식으로 응답 (클라이언트 무관)
- 비즈니스 로직은 백엔드 서비스 레이어에 구현
- 인증 토큰 생성/검증은 백엔드에서만 수행

### 2.2 계층 분리 (Layer Separation)

#### 2.2.1 3계층 아키텍처 개요

```
┌─────────────────────────────────────┐
│     Presentation Layer              │  ← 사용자 인터페이스
│  (React + Zustand + Tailwind)       │
└──────────────┬──────────────────────┘
               │ HTTP/HTTPS (REST API)
┌──────────────▼──────────────────────┐
│   Application/Business Layer        │  ← 비즈니스 로직
│  (Node.js + Express + JWT)          │
└──────────────┬──────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────┐
│        Data Layer                   │  ← 데이터 영속성
│     (PostgreSQL on Supabase)        │
└─────────────────────────────────────┘
```

#### 2.2.2 계층별 책임 요약

| 계층             | 주요 책임                             | 금지 사항                            |
| ---------------- | ------------------------------------- | ------------------------------------ |
| **Presentation** | UI 렌더링, 사용자 입력 수집, API 호출 | 비즈니스 로직, DB 접근, 토큰 생성    |
| **Application**  | 비즈니스 로직, 인증/인가, 데이터 검증 | UI 렌더링, 직접적인 사용자 입력 처리 |
| **Data**         | 데이터 저장, 쿼리 실행, 무결성 보장   | 비즈니스 로직, 복잡한 계산           |

### 2.3 순환 의존성 방지

**금지 패턴:**

❌ 컴포넌트 A → 컴포넌트 B → 컴포넌트 A
❌ 서비스 A → 서비스 B → 서비스 A
❌ 스토어 A → 스토어 B → 스토어 A

**해결 방법:**

1. **공통 모듈 추출**: 공유 로직을 별도 유틸리티로 분리
2. **이벤트 기반 통신**: 직접 참조 대신 이벤트/콜백 사용
3. **의존성 역전**: 인터페이스를 통한 간접 참조

## 3. 계층별 상세 가이드

### 3.1 Presentation Layer (프론트엔드) - 상세 가이드

#### 3.1.1 계층 구조

```
Pages (페이지)
  ↓
Layouts (레이아웃)
  ↓
Domain Components (도메인 컴포넌트)
  ↓
Common Components (공통 컴포넌트)
```

#### 3.1.2 책임과 역할

**✅ 해야 할 일:**

- UI 렌더링 및 사용자 인터랙션 처리
- 사용자 입력 수집 및 기본 검증 (클라이언트 측 유효성 검사)
- API 서비스 호출 (직접 Axios가 아닌 서비스 레이어를 통해)
- 상태 관리 (Zustand 스토어 활용)
- 로딩, 에러, 성공 상태 표시
- 라우팅 처리

**❌ 하지 말아야 할 일:**

- 복잡한 비즈니스 로직 구현 (예: 할일 우선순위 계산 알고리즘)
- 데이터베이스 직접 접근 (Supabase 클라이언트 사용 금지)
- JWT 토큰 생성/검증 로직
- 서버 환경 변수 접근 (VITE\_ 접두사 없는 변수)
- 복잡한 데이터 변환 로직 (서비스 레이어로 분리)

#### 3.1.3 컴포넌트 분류

**1. Pages (라우트 컴포넌트)**

- 역할: URL 경로와 1:1 매핑
- 크기: 큰 편 (여러 컴포넌트 조합)
- 상태: 페이지 레벨 상태 관리
- 예시: `LoginPage.jsx`, `DashboardPage.jsx`, `CalendarPage.jsx`

**2. Layouts (레이아웃 컴포넌트)**

- 역할: 페이지 구조 정의 (헤더, 사이드바, 푸터 등)
- 재사용: 여러 페이지에서 공유
- 예시: `MainLayout.jsx`, `AuthLayout.jsx`

**3. Domain Components (도메인 컴포넌트)**

- 역할: 비즈니스 도메인 특화 UI
- 재사용: 도메인 내에서만 사용
- 예시: `TodoItem.jsx`, `TodoForm.jsx`, `CalendarDay.jsx`

**4. Common Components (공통 컴포넌트)**

- 역할: 프로젝트 전반에서 재사용 가능한 UI
- 특징: 비즈니스 로직 없음, 순수 UI
- 예시: `Button.jsx`, `Input.jsx`, `Modal.jsx`, `Dropdown.jsx`

#### 3.1.4 상태 관리 규칙

**전역 상태 (Zustand)**

- 사용자 인증 정보
- 할일 목록 데이터
- 알림 목록
- 캘린더 데이터

**로컬 상태 (useState)**

- 폼 입력값
- UI 토글 상태 (모달 열림/닫힘)
- 임시 UI 상태

### 3.2 Application Layer (백엔드) - 상세 가이드

#### 3.2.1 계층 구조

```
API Handler (Controller)
  ↓
Business Logic (Service)
  ↓
Data Access (Repository)
  ↓
Database
```

#### 3.2.2 책임과 역할

**✅ 해야 할 일:**

- HTTP 요청/응답 처리
- 비즈니스 로직 구현 (할일 생성 시 알림 자동 생성 등)
- 인증/인가 (JWT 토큰 생성, 검증, 갱신)
- 데이터 검증 (서버 측 유효성 검사)
- 에러 처리 및 표준화된 응답 반환
- 데이터베이스 쿼리 실행

**❌ 하지 말아야 할 일:**

- UI 렌더링 관련 로직
- 프론트엔드 상태 관리 구조에 의존
- HTML, CSS 생성
- 클라이언트 특화 로직 (브라우저 API 사용 등)

#### 3.2.3 함수 내 역할 분리

각 API 엔드포인트 파일 내에서 다음과 같이 역할을 분리:

**1. Controller (요청/응답 처리)**

- HTTP 요청 파싱
- 응답 포맷팅
- 상태 코드 결정

**2. Service (비즈니스 로직)**

- 핵심 비즈니스 규칙 구현
- 여러 데이터 소스 조합
- 복잡한 계산 및 변환

**3. Repository (데이터 접근)**

- SQL 쿼리 실행
- 데이터베이스 연결 관리
- 쿼리 결과 매핑

#### 3.2.4 Serverless Function 특성 고려

**Stateless 설계:**

- 각 요청은 독립적으로 처리
- 메모리에 상태 저장 금지
- 데이터베이스 연결 풀링 최적화

**Cold Start 최적화:**

- 함수 크기 최소화
- 외부 의존성 최소화
- 필요시에만 모듈 import

### 3.3 Data Layer (데이터베이스) - 상세 가이드

#### 3.3.1 책임과 역할

**✅ 해야 할 일:**

- 데이터 영속성 보장
- 쿼리 실행 및 결과 반환
- 데이터 무결성 제약 조건 강제
- 인덱스를 통한 쿼리 성능 최적화
- 트랜잭션 관리

**❌ 하지 말아야 할 일:**

- Stored Procedure에 비즈니스 로직 구현
- 복잡한 데이터 계산 (애플리케이션 레이어에서 처리)
- 외부 API 호출
- 직접적인 사용자 입력 처리

#### 3.3.2 스키마 설계 원칙

1. **정규화**: 중복 데이터 최소화 (3NF 수준)
2. **인덱스 전략**: 자주 조회되는 컬럼에 인덱스 생성
3. **외래 키 제약**: 데이터 무결성 보장
4. **NOT NULL 제약**: 필수 필드 명시
5. **기본값 설정**: created_at, updated_at 자동 생성

## 4. 코드 및 네이밍 원칙

### 4.1 언어 및 스타일

- **언어 컨벤션 준수:** JavaScript (ES6+) 표준 문법과 모범 사례를 따른다.
- **코드 스타일 자동화:** **ESLint**와 **Prettier**를 설정하여 코드 컨벤션을 강제하고, 커밋 전에 자동으로 코드를 정리하도록 한다.

### 4.2 네이밍 컨벤션

#### 4.2.1 JavaScript 네이밍

| 대상             | 규칙                  | 예시                                     |
| ---------------- | --------------------- | ---------------------------------------- |
| **변수**         | camelCase             | `todoList`, `userName`, `isCompleted`    |
| **함수**         | camelCase (동사 시작) | `getTodos`, `createTodo`, `handleSubmit` |
| **클래스**       | PascalCase            | `TodoService`, `AuthManager`             |
| **컴포넌트**     | PascalCase            | `TodoItem`, `LoginPage`                  |
| **상수**         | UPPER_SNAKE_CASE      | `MAX_TODO_LIMIT`, `API_TIMEOUT`          |
| **Boolean 변수** | is/has/can 접두사     | `isLoading`, `hasError`, `canEdit`       |

#### 4.2.2 파일 네이밍

| 파일 종류           | 규칙                      | 예시                                 |
| ------------------- | ------------------------- | ------------------------------------ |
| **React 컴포넌트**  | PascalCase.jsx            | `TodoItem.jsx`, `CalendarView.jsx`   |
| **페이지 컴포넌트** | PascalCase + Page         | `DashboardPage.jsx`, `LoginPage.jsx` |
| **Zustand 스토어**  | camelCase + .store.js     | `user.store.js`, `todo.store.js`     |
| **서비스**          | camelCase + Service.js    | `todoService.js`, `authService.js`   |
| **유틸리티**        | camelCase + Utils.js      | `dateUtils.js`, `validationUtils.js` |
| **상수 파일**       | camelCase + .constants.js | `api.constants.js`                   |

#### 4.2.3 API 엔드포인트 네이밍

**RESTful 원칙 준수:**

| 메서드 | 경로                      | 용도      | 명명 규칙        |
| ------ | ------------------------- | --------- | ---------------- |
| GET    | `/api/todos`              | 목록 조회 | 명사 복수형      |
| GET    | `/api/todos/:id`          | 단건 조회 | 명사 복수형 + ID |
| POST   | `/api/todos`              | 생성      | 명사 복수형      |
| PUT    | `/api/todos/:id`          | 전체 수정 | 명사 복수형 + ID |
| PATCH  | `/api/todos/:id/complete` | 부분 수정 | 명사 + 동작      |
| DELETE | `/api/todos/:id`          | 삭제      | 명사 복수형 + ID |

**규칙:**

- 리소스는 항상 명사 복수형
- 행위는 HTTP 메서드로 표현 (URL에 동사 사용 지양)
- 예외: 특정 동작은 PATCH + 동작명 허용 (`/complete`, `/restore`)

### 4.3 주석 작성 규칙

- **'무엇'보다 '왜'를 설명**: 코드가 무엇을 하는지는 코드 자체로 명확해야 함
- **복잡한 로직**: 알고리즘이나 계산식에 대한 설명 추가
- **특별한 결정**: 왜 이 방법을 선택했는지 배경 설명
- **TODO 주석**: 향후 개선 사항 명시 (`// TODO: v1.1에서 캐싱 추가`)

## 5. 테스트 및 품질 원칙

### 5.1 테스트 전략

#### 5.1.1 v1.0 테스트 범위

- **자동화 테스트**: 제외 (빠른 MVP 출시 우선)
- **수동 테스트**: 핵심 기능 품질 보장
- **향후 계획**: v1.1부터 자동화 테스트 도입

#### 5.1.2 수동 테스트 체크리스트

**기능 테스트:**

- [ ] 회원가입/로그인/로그아웃 정상 동작
- [ ] 할일 CRUD 모든 기능 동작
- [ ] 우선순위 정렬 정확성
- [ ] 마감일 알림 발송 시점
- [ ] 휴지통 복원/영구삭제
- [ ] 캘린더 뷰 정상 표시

**API 테스트 (Postman 활용):**

- [ ] 모든 엔드포인트 응답 확인
- [ ] 인증 토큰 검증
- [ ] 에러 응답 형식 일관성
- [ ] 응답 시간 1000ms 이내

**브라우저 호환성:**

- [ ] Chrome 최신 버전
- [ ] Firefox 최신 버전
- [ ] Safari 최신 버전 (macOS)
- [ ] Edge 최신 버전

**반응형 테스트:**

- [ ] 모바일 (375px ~ 767px)
- [ ] 태블릿 (768px ~ 1023px)
- [ ] 데스크탑 (1024px 이상)

### 5.2 에러 핸들링

#### 5.2.1 프론트엔드 에러 처리

**에러 레벨:**

- **Critical**: 앱 전체 동작 불가 (인증 실패, 네트워크 오류)
- **Warning**: 일부 기능 제한 (API 일시 오류)
- **Info**: 사용자 입력 오류 (유효성 검사 실패)

**에러 표시 방법:**

- Toast 알림: 일시적 오류 (3초 후 자동 사라짐)
- 모달: 중요한 오류 (사용자 확인 필요)
- 인라인 메시지: 폼 유효성 검사 오류

#### 5.2.2 백엔드 에러 처리

**표준 에러 응답 형식:**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시할 메시지",
    "details": "개발자용 상세 정보 (선택)"
  }
}
```

**HTTP 상태 코드 사용:**

- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청 (유효성 검사 실패)
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 리소스 충돌 (중복 이메일 등)
- `500 Internal Server Error`: 서버 오류

**에러 코드 규칙:**

- `AUTH_*`: 인증 관련 (예: `AUTH_INVALID_TOKEN`)
- `VALIDATION_*`: 유효성 검사 (예: `VALIDATION_EMAIL_INVALID`)
- `NOT_FOUND_*`: 리소스 없음 (예: `NOT_FOUND_TODO`)
- `CONFLICT_*`: 충돌 (예: `CONFLICT_EMAIL_EXISTS`)

### 5.3 코드 품질

#### 5.3.1 순수 함수 작성

**향후 테스트 도입을 위한 준비:**

- 부작용(Side Effect) 최소화
- 입력이 같으면 항상 같은 출력 반환
- 외부 상태 변경 금지

**순수 함수 예시:**

- 날짜 포맷팅 함수
- 우선순위 계산 함수
- 유효성 검사 함수

#### 5.3.2 코드 리뷰 체크리스트

**1인 개발 셀프 리뷰 항목:**

- [ ] 네이밍 컨벤션 준수
- [ ] 불필요한 주석 제거
- [ ] 하드코딩된 값 없음 (환경 변수 사용)
- [ ] 에러 처리 누락 없음
- [ ] 중복 코드 제거
- [ ] 보안 취약점 점검 (XSS, SQL Injection)
- [ ] 성능 병목 지점 확인

## 6. 설정, 보안, 운영 원칙

### 6.1 환경 변수 관리

#### 6.1.1 프론트엔드 환경 변수

**Vite 환경 변수 규칙:**

- 브라우저 노출 변수: 반드시 `VITE_` 접두사 사용
- 서버 전용 변수: 프론트엔드에 포함하지 않음

**필수 환경 변수:**

- `VITE_API_URL`: 백엔드 API 기본 URL
- `VITE_ENV`: 환경 구분 (development, production)

**파일 구조:**

- `.env.development`: 로컬 개발 환경
- `.env.production`: 프로덕션 환경
- `.env.example`: 템플릿 (Git 커밋 가능)

#### 6.1.2 백엔드 환경 변수

**필수 환경 변수:**

- `DATABASE_URL`: Supabase PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 서명 키 (최소 32자)
- `JWT_REFRESH_SECRET`: Refresh Token 서명 키
- `NODE_ENV`: 환경 구분

**보안 규칙:**

- 절대 코드에 하드코딩 금지
- `.env` 파일은 `.gitignore`에 포함
- Vercel 환경 변수로 프로덕션 값 관리

### 6.2 보안 원칙

#### 6.2.1 통신 보안

**HTTPS 필수:**

- Vercel 자동 SSL 인증서 활용
- 모든 API 통신 암호화
- Mixed Content 방지

#### 6.2.2 인증 보안

**비밀번호 보안:**

- bcrypt 해싱 (Salt rounds: 10)
- 평문 비밀번호 로깅 금지
- 비밀번호 최소 요구사항: 8자 이상

**JWT 토큰 관리:**

- Access Token: 15분 유효 (짧은 수명)
- Refresh Token: 7일 유효
- httpOnly Cookie 사용 권장 (XSS 방지)
- 토큰 payload에 민감정보 제외

**인증 흐름:**

1. 로그인 → Access Token + Refresh Token 발급
2. API 요청 → Access Token 검증
3. 만료 시 → Refresh Token으로 갱신
4. Refresh Token 만료 → 재로그인 필요

#### 6.2.3 입력값 검증

**프론트엔드 검증:**

- 이메일 형식 검증
- 비밀번호 강도 확인
- 필수 필드 확인
- XSS 방지 (입력값 이스케이프)

**백엔드 검증 (필수):**

- 모든 입력값 재검증 (프론트엔드 우회 가능)
- SQL Injection 방지 (Prepared Statement)
- 파일 업로드 검증 (MIME 타입, 크기)
- Rate Limiting (분당 100회)

#### 6.2.4 CORS 정책

**허용 도메인:**

- 개발: `http://localhost:5173`
- 프로덕션: `https://whattodo.vercel.app`

**CORS 헤더:**

- `Access-Control-Allow-Origin`: 허용 도메인만
- `Access-Control-Allow-Methods`: GET, POST, PUT, PATCH, DELETE
- `Access-Control-Allow-Headers`: Content-Type, Authorization

### 6.3 배포 전략

#### 6.3.1 배포 플랫폼

**Vercel 배포:**

- 프론트엔드: Vite 빌드 자동 배포
- 백엔드: Serverless Functions 자동 배포
- 환경 변수: Vercel Dashboard에서 관리

#### 6.3.2 배포 프로세스

**v1.0 (수동 배포):**

1. 로컬에서 기능 개발 및 테스트
2. Git commit & push
3. Vercel Dashboard에서 수동 배포

**v1.1 이후 (자동 배포):**

1. `main` 브랜치 push 시 자동 배포
2. Pull Request 시 미리보기 배포
3. 배포 전 자동 린트/테스트 (CI/CD)

## 7. 디렉토리 구조 상세 설명

### 7.1 프론트엔드 (React) - 상세 구조

```
/src
├── api/                # API 호출 서비스
│   ├── client.js       # Axios 인스턴스 설정 (baseURL, 인터셉터)
│   ├── authApi.js      # 인증 API 함수 (login, signup, refresh)
│   ├── todoApi.js      # 할일 API 함수 (getTodos, createTodo 등)
│   └── userApi.js      # 사용자 API 함수 (getProfile, updateProfile)
│
├── assets/             # 정적 파일
│   ├── images/         # 이미지 파일
│   ├── fonts/          # 폰트 파일 (필요 시)
│   └── icons/          # 아이콘 파일
│
├── components/         # UI 컴포넌트
│   ├── common/         # 범용 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Dropdown.jsx
│   │   └── LoadingSpinner.jsx
│   │
│   └── domain/         # 도메인 특화 컴포넌트
│       ├── todo/
│       │   ├── TodoItem.jsx
│       │   ├── TodoList.jsx
│       │   ├── TodoForm.jsx
│       │   └── TodoFilter.jsx
│       │
│       ├── calendar/
│       │   ├── CalendarView.jsx
│       │   ├── CalendarDay.jsx
│       │   └── CalendarHeader.jsx
│       │
│       └── auth/
│           ├── LoginForm.jsx
│           └── SignupForm.jsx
│
├── constants/          # 전역 상수
│   ├── api.constants.js       # API 관련 상수
│   ├── route.constants.js     # 라우트 경로
│   └── todo.constants.js      # 할일 우선순위 등
│
├── hooks/              # 커스텀 훅
│   ├── useAuth.js      # 인증 관련 훅
│   ├── useTodos.js     # 할일 관련 훅
│   └── useDebounce.js  # 유틸리티 훅
│
├── layouts/            # 레이아웃 컴포넌트
│   ├── MainLayout.jsx  # 인증 후 메인 레이아웃
│   └── AuthLayout.jsx  # 로그인/회원가입 레이아웃
│
├── pages/              # 페이지 컴포넌트
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── CalendarPage.jsx
│   ├── TrashPage.jsx
│   └── SettingsPage.jsx
│
├── store/              # Zustand 상태 관리
│   ├── auth.store.js   # 인증 상태
│   ├── todo.store.js   # 할일 상태
│   └── ui.store.js     # UI 상태 (모달, 토스트 등)
│
├── styles/             # 스타일
│   ├── index.css       # Tailwind CSS import
│   └── globals.css     # 전역 CSS
│
├── utils/              # 유틸리티 함수
│   ├── dateUtils.js    # 날짜 포맷팅
│   ├── validationUtils.js  # 유효성 검사
│   └── storageUtils.js # LocalStorage 헬퍼
│
├── App.jsx             # 최상위 컴포넌트 (라우터 설정)
└── main.jsx            # 진입점
```

#### 7.1.1 디렉토리별 설명

**`/api`** - API 통신 계층

- 목적: 백엔드 API와의 모든 통신 담당
- 규칙: 컴포넌트에서 직접 Axios 사용 금지, 항상 이 계층을 통해 호출
- 책임: HTTP 요청, 응답 변환, 에러 처리

**`/components/common`** - 범용 컴포넌트

- 목적: 프로젝트 전반에서 재사용 가능한 UI
- 규칙: 비즈니스 로직 포함 금지, Props만 통해 데이터 전달
- 예시: Button, Input, Modal, Dropdown

**`/components/domain`** - 도메인 컴포넌트

- 목적: 특정 도메인(할일, 캘린더)에 특화된 UI
- 규칙: 도메인별로 하위 디렉토리 구성
- 예시: TodoItem, CalendarView

**`/store`** - 상태 관리

- 목적: 전역 상태 관리 (Zustand)
- 규칙: 도메인별로 스토어 분리, 각 스토어는 독립적
- 예시: auth.store.js, todo.store.js

**`/hooks`** - 커스텀 훅

- 목적: 재사용 가능한 React 훅
- 규칙: 컴포넌트 로직 추출, UI와 로직 분리
- 예시: useAuth, useTodos, useDebounce

**`/utils`** - 유틸리티 함수

- 목적: 순수 함수 기반 헬퍼
- 규칙: React/컴포넌트 의존성 없음, 테스트 가능한 순수 함수
- 예시: 날짜 포맷팅, 유효성 검사

### 7.2 백엔드 (Node.js/Express on Vercel) - 상세 구조

```
/api
├── auth/               # 인증 API
│   ├── login.js        # POST /api/auth/login
│   ├── signup.js       # POST /api/auth/signup
│   ├── logout.js       # POST /api/auth/logout
│   └── refresh.js      # POST /api/auth/refresh
│
├── todos/              # 할일 API
│   ├── index.js        # GET /api/todos, POST /api/todos
│   ├── [id].js         # GET, PUT, DELETE /api/todos/:id
│   ├── complete.js     # PATCH /api/todos/:id/complete
│   └── restore.js      # PATCH /api/todos/:id/restore
│
├── users/              # 사용자 API
│   └── me.js           # GET /api/users/me, PUT /api/users/me
│
├── trash/              # 휴지통 API
│   ├── index.js        # GET /api/trash
│   └── [id].js         # DELETE /api/trash/:id (영구 삭제)
│
├── calendar/           # 캘린더 API
│   └── holidays.js     # GET /api/calendar/holidays
│
├── _lib/               # 공유 모듈 (Vercel _ 접두사 규칙)
│   ├── db.js           # 데이터베이스 연결 및 쿼리 헬퍼
│   │   - getConnection()
│   │   - query(sql, params)
│   │   - transaction()
│   │
│   ├── middleware/     # 미들웨어 함수
│   │   ├── auth.js     # JWT 토큰 검증
│   │   ├── cors.js     # CORS 설정
│   │   └── errorHandler.js  # 에러 처리
│   │
│   ├── services/       # 비즈니스 로직
│   │   ├── authService.js
│   │   ├── todoService.js
│   │   └── notificationService.js
│   │
│   ├── repositories/   # 데이터 접근 계층
│   │   ├── userRepository.js
│   │   ├── todoRepository.js
│   │   └── notificationRepository.js
│   │
│   └── utils/          # 유틸리티
│       ├── jwt.js      # JWT 생성/검증
│       ├── bcrypt.js   # 비밀번호 해싱
│       └── validation.js  # 입력값 검증
│
└── index.js            # 헬스 체크 (GET /api)
```

#### 7.2.1 백엔드 파일 역할

**API 엔드포인트 파일** (예: `login.js`)

- 역할: HTTP 요청/응답 처리 (Controller)
- 구조: handler 함수 export
- 책임: 요청 파싱 → 서비스 호출 → 응답 반환

**`_lib/services/`** - 비즈니스 로직 계층

- 역할: 핵심 비즈니스 규칙 구현
- 예시: 할일 생성 시 알림 자동 생성, 우선순위 계산
- 책임: 여러 Repository 조합, 복잡한 로직 처리

**`_lib/repositories/`** - 데이터 접근 계층

- 역할: 데이터베이스 쿼리 실행
- 예시: findUserByEmail(), createTodo()
- 책임: SQL 쿼리 작성 및 실행, 결과 매핑

**`_lib/middleware/`** - 미들웨어

- 역할: 공통 전처리/후처리 로직
- 예시: JWT 검증, CORS 설정, 에러 핸들링
- 책임: 요청 가로채기, 검증, 변환

## 8. 데이터 플로우 및 시퀀스

### 8.1 할일 생성 플로우

#### 8.1.1 전체 시퀀스

```
[사용자]
   │
   ├─ (1) 할일 입력 폼 작성
   │
   ▼
[TodoForm 컴포넌트]
   │
   ├─ (2) 폼 유효성 검사 (클라이언트)
   │   - 제목 필수 확인
   │   - 제목 길이 확인 (100자 이하)
   │
   ├─ (3) handleSubmit 이벤트
   │
   ▼
[todo.store.js]
   │
   ├─ (4) createTodo 액션 호출
   │
   ▼
[todoApi.js]
   │
   ├─ (5) POST /api/todos 요청
   │   - Headers: Authorization Bearer token
   │   - Body: { title, description, priority, dueDate }
   │
   ▼
[백엔드 API: /api/todos/index.js]
   │
   ├─ (6) CORS 미들웨어 적용
   │
   ├─ (7) JWT 인증 미들웨어
   │   - 토큰 검증
   │   - user_id 추출
   │
   ├─ (8) 요청 파싱 및 검증
   │   - 필수 필드 확인
   │   - 입력값 타입 검증
   │
   ▼
[todoService.js]
   │
   ├─ (9) 비즈니스 로직 실행
   │   - 우선순위 기본값 설정 (NORMAL)
   │   - 트랜잭션 시작
   │
   ▼
[todoRepository.js]
   │
   ├─ (10) 데이터베이스 INSERT
   │   - SQL: INSERT INTO todos (...)
   │   - 생성된 todo_id 반환
   │
   ▼
[notificationService.js]
   │
   ├─ (11) 마감일 알림 생성 (조건부)
   │   - D-1 알림 생성
   │   - D-day 알림 생성
   │
   ├─ (12) 트랜잭션 커밋
   │
   ▼
[API 응답]
   │
   ├─ (13) 성공 응답 반환
   │   - Status: 201 Created
   │   - Body: { todo: {...} }
   │
   ▼
[todoApi.js]
   │
   ├─ (14) 응답 데이터 파싱
   │
   ▼
[todo.store.js]
   │
   ├─ (15) 스토어 상태 업데이트
   │   - 새 할일을 목록에 추가
   │
   ▼
[TodoList 컴포넌트]
   │
   ├─ (16) UI 자동 리렌더링
   │   - 새 할일이 목록에 표시됨
   │
   ▼
[사용자]
   └─ (17) 생성 완료 확인
```

### 8.2 인증 플로우 (JWT 토큰)

#### 8.2.1 로그인 시퀀스

```
[사용자 로그인 요청]
   │
   ▼
POST /api/auth/login
   │
   ├─ 이메일/비밀번호 검증
   ├─ bcrypt로 비밀번호 확인
   │
   ├─ ✅ 인증 성공
   │   │
   │   ├─ Access Token 생성 (15분 유효)
   │   ├─ Refresh Token 생성 (7일 유효)
   │   │
   │   └─ 응답: { accessToken, refreshToken, user }
   │
   ▼
[프론트엔드 저장]
   │
   ├─ LocalStorage: accessToken
   ├─ LocalStorage: refreshToken
   └─ Zustand Store: user 정보
```

#### 8.2.2 인증된 API 요청 시퀀스

```
[API 요청]
   │
   ├─ Headers: Authorization: Bearer <accessToken>
   │
   ▼
[인증 미들웨어]
   │
   ├─ 토큰 존재 확인
   ├─ JWT 서명 검증
   ├─ 토큰 만료 확인
   │
   ├─ ✅ 유효한 토큰
   │   │
   │   ├─ user_id 추출
   │   └─ 다음 핸들러로 전달
   │
   ├─ ❌ 만료된 토큰 (401 Unauthorized)
   │   │
   │   ▼
   │   [프론트엔드]
   │   │
   │   ├─ Refresh Token으로 갱신 요청
   │   ├─ POST /api/auth/refresh
   │   │
   │   ├─ ✅ 갱신 성공
   │   │   └─ 새 Access Token 발급
   │   │       └─ 원래 요청 재시도
   │   │
   │   └─ ❌ 갱신 실패
   │       └─ 로그아웃 처리
   │           └─ 로그인 페이지로 리다이렉트
   │
   └─ ❌ 잘못된 토큰 (401 Unauthorized)
       └─ 로그아웃 처리
```

### 8.3 상태 관리 플로우 (Zustand)

#### 8.3.1 스토어 구조

```
[auth.store.js]
   ├─ State:
   │   ├─ user: { id, email, nickname, ... }
   │   ├─ accessToken: string
   │   └─ isAuthenticated: boolean
   │
   └─ Actions:
       ├─ login(credentials)
       ├─ logout()
       ├─ refreshToken()
       └─ updateProfile(data)

[todo.store.js]
   ├─ State:
   │   ├─ todos: Todo[]
   │   ├─ filter: 'all' | 'active' | 'completed'
   │   ├─ sortBy: 'priority' | 'dueDate'
   │   └─ isLoading: boolean
   │
   └─ Actions:
       ├─ fetchTodos()
       ├─ createTodo(data)
       ├─ updateTodo(id, data)
       ├─ deleteTodo(id)
       ├─ completeTodo(id)
       ├─ setFilter(filter)
       └─ setSortBy(sortBy)

[ui.store.js]
   ├─ State:
   │   ├─ isModalOpen: boolean
   │   ├─ modalContent: ReactNode
   │   └─ toasts: Toast[]
   │
   └─ Actions:
       ├─ openModal(content)
       ├─ closeModal()
       ├─ showToast(message, type)
       └─ removeToast(id)
```

## 9. 성능 최적화 가이드

### 9.1 프론트엔드 최적화

#### 9.1.1 React 컴포넌트 최적화

**1. 불필요한 리렌더링 방지**

- `React.memo()` 사용하여 Props 변경 시에만 리렌더링
- `useMemo()` 사용하여 비싼 계산 결과 캐싱
- `useCallback()` 사용하여 함수 참조 유지

**적용 대상:**

- TodoItem: 개별 할일 항목 (목록이 길 때 효과적)
- CalendarDay: 캘린더 날짜 셀 (30개 이상 렌더링)
- Button, Input: 자주 사용되는 공통 컴포넌트

**2. 리스트 렌더링 최적화**

- `key` prop에 안정적인 고유값 사용 (index 지양)
- 가상 스크롤링 고려 (할일이 100개 이상일 때)

**3. 코드 스플리팅**

- React.lazy()와 Suspense로 페이지별 분할
- 초기 로딩 시간 단축

**적용 예시:**

```javascript
// 페이지별 코드 스플리팅
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
```

#### 9.1.2 네트워크 최적화

**1. API 요청 최적화**

- Debouncing: 검색 입력 시 (300ms)
- Throttling: 스크롤 이벤트 (100ms)
- 요청 취소: 컴포넌트 언마운트 시 진행 중인 요청 취소

**2. 캐싱 전략**

- 할일 목록: 5분간 캐시 (stale-while-revalidate)
- 사용자 프로필: 세션 동안 캐시
- 공휴일 데이터: 일일 캐시

**3. 이미지 최적화**

- 프로필 사진: WebP 포맷, 최대 200KB
- Lazy Loading: Intersection Observer 활용

#### 9.1.3 번들 크기 최적화

**1. Tree Shaking**

- Named import 사용 (`import { Button } from 'lib'`)
- 사용하지 않는 코드 제거

**2. 외부 라이브러리 최소화**

- Lodash 대신 네이티브 JS 메서드 활용
- Moment.js 대신 date-fns (더 작은 번들 크기)

### 9.2 백엔드 최적화

#### 9.2.1 데이터베이스 최적화

**1. 인덱스 전략**

```sql
-- 자주 조회되는 컬럼에 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_status ON todos(status);

-- 복합 인덱스
CREATE INDEX idx_todos_user_status ON todos(user_id, status);
```

**2. 쿼리 최적화**

- N+1 문제 방지: JOIN 활용
- 필요한 컬럼만 SELECT
- LIMIT/OFFSET 대신 커서 기반 페이지네이션 (대용량 데이터)

**3. 커넥션 풀링**

- PostgreSQL 연결 풀 설정
- 최대 연결 수: 20개
- Idle timeout: 30초

#### 9.2.2 Serverless Function 최적화

**1. Cold Start 최소화**

- 함수 크기 최소화 (의존성 최소화)
- 글로벌 스코프에서 DB 연결 재사용
- Warm-up 요청 (필요 시)

**2. 실행 시간 단축**

- 비동기 처리 활용
- 불필요한 로직 제거
- 병렬 처리 가능한 작업은 Promise.all() 사용

### 9.3 성능 모니터링 목표

**프론트엔드:**

- First Contentful Paint (FCP): 1.5초 이내
- Time to Interactive (TTI): 3초 이내
- Lighthouse 점수: 90점 이상

**백엔드:**

- API 응답 시간: 1000ms 이내 (PRD 요구사항)
- 데이터베이스 쿼리: 100ms 이내
- 동시 사용자: 100명 처리 가능

## 10. 개발 체크리스트

### 10.1 기능 개발 전 체크리스트

**설계 단계:**

- [ ] PRD 요구사항 확인
- [ ] 아키텍처 원칙 준수 여부 확인
- [ ] API 명세서 작성/업데이트
- [ ] 데이터베이스 스키마 변경 필요 여부 확인

### 10.2 코드 작성 중 체크리스트

**일반:**

- [ ] 네이밍 컨벤션 준수 (변수: camelCase, 컴포넌트: PascalCase)
- [ ] 환경 변수 사용 (하드코딩 금지)
- [ ] 에러 처리 구현
- [ ] 주석 작성 (복잡한 로직에 '왜' 설명)

**프론트엔드:**

- [ ] 컴포넌트 단일 책임 원칙
- [ ] Props 타입 명시 (PropTypes 또는 주석)
- [ ] 상태 관리 적절성 (전역 vs 로컬)
- [ ] API 호출 시 로딩/에러 상태 처리
- [ ] 반응형 디자인 적용

**백엔드:**

- [ ] Controller-Service-Repository 분리
- [ ] 입력값 검증 (프론트엔드 + 백엔드)
- [ ] SQL Injection 방지 (Prepared Statement)
- [ ] 인증/인가 처리
- [ ] 표준 에러 응답 형식 준수

### 10.3 코드 완성 후 체크리스트

**기능 테스트:**

- [ ] 정상 시나리오 테스트
- [ ] 에러 시나리오 테스트 (잘못된 입력, 네트워크 오류 등)
- [ ] 엣지 케이스 테스트 (경계값, null, undefined)
- [ ] 브라우저 호환성 테스트 (Chrome, Firefox, Safari, Edge)
- [ ] 반응형 테스트 (모바일, 태블릿, 데스크탑)

**보안 검토:**

- [ ] XSS 취약점 점검
- [ ] CSRF 방지 (토큰 기반 인증 사용 시 해당 없음)
- [ ] SQL Injection 방지
- [ ] 민감 정보 노출 여부 (로그, 에러 메시지)
- [ ] HTTPS 통신 확인

**성능 검토:**

- [ ] API 응답 시간 1000ms 이내
- [ ] 불필요한 리렌더링 없음
- [ ] 큰 리스트의 가상 스크롤링 적용 여부
- [ ] 이미지 최적화 (크기, 포맷)
- [ ] 번들 크기 확인 (불필요한 라이브러리 없음)

### 10.4 PR (Pull Request) 제출 전 체크리스트

**코드 품질:**

- [ ] ESLint 에러 없음
- [ ] Prettier 포맷팅 적용
- [ ] 미사용 import 제거
- [ ] console.log 제거 (디버깅용)
- [ ] 중복 코드 제거

**문서화:**

- [ ] API 명세서 업데이트 (API 변경 시)
- [ ] README 업데이트 (필요 시)
- [ ] 주요 결정 사항 주석 추가

**Git:**

- [ ] 의미 있는 커밋 메시지
- [ ] 하나의 PR에 하나의 기능만 포함
- [ ] 불필요한 파일 커밋 제외 (.env, node_modules 등)

### 10.5 배포 전 체크리스트

**환경 설정:**

- [ ] Vercel 환경 변수 설정 완료
- [ ] 데이터베이스 연결 테스트
- [ ] CORS 설정 확인 (프로덕션 도메인)
- [ ] HTTPS 인증서 확인

**최종 테스트:**

- [ ] 프로덕션 환경에서 전체 기능 테스트
- [ ] 성능 테스트 (Lighthouse)
- [ ] 보안 점검 (OWASP Top 10)
- [ ] 롤백 계획 수립

**모니터링:**

- [ ] 에러 로깅 설정
- [ ] 헬스 체크 엔드포인트 확인
- [ ] 배포 후 모니터링 계획

---

## 문서 요약

이 문서는 WHATtodo 프로젝트의 설계 원칙과 개발 가이드를 제공합니다.

**핵심 원칙:**

1. 단방향 의존성: 프론트엔드 → API → 데이터베이스
2. 계층 분리: Presentation - Application - Data
3. 일관성: 네이밍, 구조, 패턴의 통일성
4. 보안 우선: 입력값 검증, JWT 인증, HTTPS

**개발 시 참고:**

- 계층별 상세 가이드 (섹션 3)
- 디렉토리 구조 설명 (섹션 7)
- 데이터 플로우 시퀀스 (섹션 8)
- 개발 체크리스트 (섹션 10)

**문서 버전:** 2.0
**마지막 업데이트:** 2025-11-26

## Error Model & Code Catalog
### Error JSON Contract
```json
{
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "리소스를 찾을 수 없습니다.",
    "details": "todo_id=..."
  }
}
```

### Naming Rule
- **HTTP 400**: `VALIDATION_*` (예: `VALIDATION_TITLE_REQUIRED`, `VALIDATION_EMAIL_INVALID`)
- **HTTP 401/403**: `AUTH_*` / `FORBIDDEN_*` (예: `AUTH_INVALID_CREDENTIALS`, `AUTH_TOKEN_EXPIRED`)
- **HTTP 404**: `*_NOT_FOUND` (예: `TODO_NOT_FOUND`, `USER_NOT_FOUND`)
- **HTTP 409**: `*_CONFLICT` / `*_ALREADY_*` (예: `AUTH_EMAIL_DUPLICATE`, `TODO_ALREADY_COMPLETED`)

### Client Action Guideline
- **VALIDATION_*** → 필드 인라인 에러 및 포커스 이동
- **AUTH_*** → 로그인/토큰 재발급 플로우 유도(재시도 1회 제한)
- ***_NOT_FOUND** → 목록 화면 리다이렉트 + 토스트
- ***_CONFLICT** → 현재 상태 재동기화 후 토스트

### Catalog
| HTTP | code                        | 언제 발생                                           | 클라이언트 액션                  |
|------|-----------------------------|-----------------------------------------------------|----------------------------------|
| 400  | VALIDATION_TITLE_REQUIRED   | Todo 생성/수정 시 title 누락                       | 필드 강조 + 도움말 표시          |
| 400  | VALIDATION_DUE_DATE_PAST    | 과거 기한으로 요청(알림 생성 불가)                 | 날짜 필드 재입력 유도            |
| 401  | AUTH_INVALID_CREDENTIALS    | 로그인 자격 증명 불일치                            | 인라인 에러, 남용시 지연         |
| 401  | AUTH_TOKEN_EXPIRED          | Access 만료, Refresh도 만료                         | 재로그인 유도                    |
| 403  | FORBIDDEN_RESOURCE_OWNER    | 타 사용자 리소스 접근 시도                          | 대시보드로 이동                  |
| 404  | TODO_NOT_FOUND              | id가 존재하지 않음/삭제됨                           | 목록 리다이렉트 + 토스트         |
| 404  | USER_NOT_FOUND              | `/users/me` 조회 실패                               | 재로그인 유도                    |
| 409  | AUTH_EMAIL_DUPLICATE        | 회원가입 시 이메일 중복                             | 인라인 에러                      |
| 409  | TODO_ALREADY_COMPLETED      | 이미 완료된 Todo를 다시 완료 처리 요청              | 토스트 안내                      |
| 409  | TODO_ALREADY_ACTIVE         | 삭제 복원 시 이미 ACTIVE 상태                       | 토스트 안내                      |

### Retry Policy
- **Idempotent**: `GET`, `PUT`(동일 페이로드), `DELETE`(영구삭제 제외) → 네트워크 오류 시 1회 자동 재시도
- **Non‑Idempotent**: `POST`(생성), `PATCH`(상태변경) → 자동 재시도 금지, 사용자 확인 후 재요청
