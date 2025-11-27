# Backend API 클라이언트

서버와의 통신을 담당하는 Axios 클라이언트 및 API 서비스들입니다.

## 파일 구조

- `client.js` - Axios 인스턴스 및 인터셉터 설정
- `authApi.js` - 인증 관련 API (회원가입, 로그인, 로그아웃, 토큰 갱신)
- `todoApi.js` - 할일 관련 API (CRUD, 완료, 복원)
- `calendarApi.js` - 캘린더 관련 API

## 환경 변수

`.env` 또는 `.env.local` 파일에 다음을 설정하세요:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

기본값: `http://localhost:3000/api`

## 인터셉터 기능

### 요청 인터셉터
- Authorization 헤더에 Access Token 자동 추가

### 응답 인터셉터
- 401 에러 시 Refresh Token으로 재인증 시도
- Refresh 실패 시 로그인 페이지로 리다이렉트
