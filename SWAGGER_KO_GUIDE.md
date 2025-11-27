# WHATtodo API 한글 가이드

## 🎯 Swagger UI 접근

서버 실행 후 브라우저에서 접속:
```
http://localhost:3000/api/docs
```

---

## 📚 API 카테고리 설명

### 1️⃣ **인증 (Authentication)**
사용자 계정 관리 관련 API입니다.

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/auth/signup` | POST | 새로운 계정으로 회원 가입 |
| `/api/auth/login` | POST | 이메일과 비밀번호로 로그인 |
| `/api/auth/logout` | POST | 로그아웃 (토큰 무효화) |
| `/api/auth/refresh` | POST | Refresh Token으로 새 Access Token 발급 |

**주요 개념:**
- **Access Token**: API 요청 시 사용 (유효시간: 15분)
- **Refresh Token**: Access Token 갱신 용 (유효시간: 7일)

---

### 2️⃣ **할일 (Todos)**
할일 관리 관련 API입니다.

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/todos` | GET | 모든 할일 목록 조회 (필터, 정렬 가능) |
| `/api/todos` | POST | 새로운 할일 생성 |
| `/api/todos/{id}` | GET | 특정 할일 상세 조회 |
| `/api/todos/{id}` | PUT | 할일 정보 수정 |
| `/api/todos/{id}/complete` | PATCH | 할일을 완료 상태로 변경 |
| `/api/todos/{id}/restore` | PATCH | 삭제된 할일 복원 |
| `/api/todos/{id}` | DELETE | 할일 삭제 (휴지통으로 이동) |

**할일 상태 (Status):**
- `ACTIVE` - 활성 상태
- `COMPLETED` - 완료됨
- `DELETED` - 삭제됨 (휴지통)

**우선순위 (Priority):**
- `HIGH` - 높음 (빨강색)
- `NORMAL` - 보통 (파랑색)
- `LOW` - 낮음 (회색)

---

### 3️⃣ **휴지통 (Trash)**
삭제된 할일 관리 API입니다 (30일 후 자동 삭제).

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/trash` | GET | 휴지통 목록 조회 (페이지네이션) |
| `/api/trash/{id}` | DELETE | 휴지통 항목 영구 삭제 |

**참고:**
- 삭제된 할일은 30일 동안 휴지통에 보관됨
- 30일 후 자동으로 완전 삭제됨
- 영구 삭제 후엔 복구 불가능

---

### 4️⃣ **사용자 (Users)**
사용자 프로필 관리 API입니다.

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/users/me` | GET | 현재 사용자 프로필 조회 |
| `/api/users/me` | PUT | 프로필 수정 |

**수정 가능 정보:**
- `nickname` - 닉네임
- `profileImageUrl` - 프로필 이미지 URL
- `notificationEnabled` - 알림 활성화 여부

---

### 5️⃣ **캘린더 (Calendar)**
공휴일 정보 조회 API입니다.

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/calendar/holidays` | GET | 공휴일 조회 |

**쿼리 파라미터:**
- `year` - 연도 (예: 2025, 기본값: 현재 연도)
- `month` - 월 (1~12, 생략 시 전체 월)

**사용 예:**
```
/api/calendar/holidays?year=2025&month=1    → 2025년 1월 공휴일
/api/calendar/holidays?year=2025             → 2025년 전체 공휴일
```

---

## 🔐 인증 방법 (Authorization)

모든 API (캘린더 제외)는 **Bearer Token** 인증이 필요합니다.

### Swagger UI에서 토큰 설정

1. Swagger UI 우측 상단 **"Authorize"** 버튼 클릭
2. **"BearerAuth"** 선택
3. `accessToken` 값 입력 (로그인 응답에서 받은 값)
4. **"Authorize"** 클릭

### curl 명령어 예시

```bash
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 💡 자주 쓰는 API 흐름

### 1. 회원 가입 → 로그인

```
1. POST /api/auth/signup
   - 요청: { email, password, nickname }
   - 응답: { user, accessToken, refreshToken }

2. 응답받은 accessToken과 refreshToken을 저장
```

### 2. 할일 생성 및 관리

```
1. POST /api/todos
   - 요청: { title, priority, dueDate, ... }
   - 응답: 생성된 할일 정보

2. GET /api/todos
   - 모든 할일 목록 조회 (필터링 가능)

3. PATCH /api/todos/{id}/complete
   - 할일 완료 처리

4. DELETE /api/todos/{id}
   - 할일 삭제 (휴지통으로 이동)

5. PATCH /api/todos/{id}/restore
   - 삭제된 할일 복원
```

### 3. 토큰 갱신

```
Access Token이 만료되었을 때:

1. POST /api/auth/refresh
   - 요청: { refreshToken }
   - 응답: { accessToken }

2. 새로운 accessToken으로 API 재요청
```

---

## ⚠️ 주요 에러 코드

| 상태 코드 | 의미 | 해결 방법 |
|----------|------|----------|
| **400** | 잘못된 요청 | 입력값 확인 (필수값, 형식) |
| **401** | 인증 실패 | 토큰 확인, 다시 로그인 |
| **404** | 찾을 수 없음 | ID나 경로 확인 |
| **409** | 충돌 | 중복된 이메일 (회원가입 시) |
| **500** | 서버 에러 | 관리자에게 문의 |

---

## 📝 요청/응답 예시

### 예시 1: 회원 가입

**요청:**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동"
}
```

**응답 (201 Created):**
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "nickname": "홍길동"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 예시 2: 할일 생성

**요청:**
```json
POST /api/todos
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "title": "프로젝트 완성",
  "priority": "HIGH",
  "dueDate": "2025-12-31",
  "description": "내년까지 완료해야 함"
}
```

**응답 (201 Created):**
```json
{
  "data": {
    "todo_id": "650e8400-e29b-41d4-a716-446655440001",
    "title": "프로젝트 완성",
    "priority": "HIGH",
    "status": "ACTIVE",
    "dueDate": "2025-12-31",
    "created_at": "2025-11-27T12:00:00Z"
  }
}
```

---

### 예시 3: 공휴일 조회

**요청:**
```
GET /api/calendar/holidays?year=2025&month=1
```

**응답 (200 OK):**
```json
[
  {
    "date": "2025-01-01",
    "holiday_name": "신정",
    "description": null
  },
  {
    "date": "2025-01-29",
    "holiday_name": "설날",
    "description": null
  }
]
```

---

## 🚀 팁 & 트릭

1. **필터링으로 할일 검색:**
   ```
   GET /api/todos?status=ACTIVE&priority=HIGH&sortBy=due_date
   ```

2. **페이지네이션으로 휴지통 조회:**
   ```
   GET /api/trash?page=2&pageSize=10
   ```

3. **특정 달 공휴일만 보기:**
   ```
   GET /api/calendar/holidays?year=2025&month=12
   ```

4. **토큰 만료 전에 미리 갱신:**
   - Access Token은 15분 유효
   - 만료 전에 refresh API 호출 권장

---

## 📞 문의 사항

API 문서는 Swagger UI에서 실시간으로 테스트할 수 있습니다.
각 API 옆의 **"Try it out"** 버튼으로 직접 시도해보세요! 🎉
