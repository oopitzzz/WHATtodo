# WHATtodo Vercel 배포 가이드

**작성일**: 2025-11-28
**프로젝트**: WHATtodo
**배포 플랫폼**: Vercel

---

## 📋 배포 전 체크리스트

- [x] INT-1 백엔드 API 테스트 완료 (100%)
- [x] INT-2 프론트엔드 통합 테스트 완료 (100%)
- [x] 프론트엔드 포트 5173 고정 (`vite.config.js`)
- [x] 캘린더 공휴일 표시 수정 완료
- [x] 5가지 이슈 수정 완료
- [ ] Vercel 계정 준비
- [ ] 환경 변수 확인

---

## 🔐 필요한 환경 변수

### Backend (Vercel)

| 변수명 | 설명 | 현재 값 (로컬) |
|--------|------|---------------|
| `POSTGRES_CONNECTION_STRING` | Supabase PostgreSQL 연결 문자열 | `postgresql://postgres.dqhvtmphokkfocxeyjur:...` |
| `ACCESS_TOKEN_SECRET` | JWT Access Token 서명 키 | `access-secret-key` |
| `REFRESH_TOKEN_SECRET` | JWT Refresh Token 서명 키 | `refresh-secret-key` |
| `NODE_ENV` | 환경 (production) | `production` |

**⚠️ 주의**: 프로덕션 배포 시 `ACCESS_TOKEN_SECRET`와 `REFRESH_TOKEN_SECRET`는 더 강력한 랜덤 문자열로 변경해야 합니다.

**강력한 시크릿 생성 방법**:
```bash
# Node.js로 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (Vercel)

| 변수명 | 설명 | 값 |
|--------|------|-----|
| `VITE_API_BASE_URL` | 백엔드 API URL | `https://your-backend.vercel.app/api` |

**⚠️ 중요**: 백엔드 배포 후 실제 Vercel URL로 변경 필요

---

## 🚀 DEPLOY-1: 환경 변수 설정

### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

### 2단계: Vercel 로그인

```bash
vercel login
```

### 3단계: Backend 환경 변수 설정

```bash
cd backend

# Vercel 프로젝트 연결 (최초 1회)
vercel link

# 환경 변수 추가
vercel env add POSTGRES_CONNECTION_STRING production
# 값: postgresql://postgres.dqhvtmphokkfocxeyjur:MzueBPVlp9ptYQNC@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require

vercel env add ACCESS_TOKEN_SECRET production
# 값: (강력한 랜덤 문자열 - 위 방법으로 생성)

vercel env add REFRESH_TOKEN_SECRET production
# 값: (강력한 랜덤 문자열 - 위 방법으로 생성)

vercel env add NODE_ENV production
# 값: production
```

### 4단계: Frontend 환경 변수 설정

```bash
cd ../frontend

# Vercel 프로젝트 연결 (최초 1회)
vercel link

# 환경 변수 추가 (백엔드 배포 후 실제 URL로 변경)
vercel env add VITE_API_BASE_URL production
# 값: https://your-backend-name.vercel.app/api
```

---

## 🚀 DEPLOY-2: 백엔드 배포

### 1단계: 배포 전 테스트

```bash
cd backend

# 의존성 설치 확인
npm install

# 로컬 테스트
npm test

# 서버 시작 테스트
npm start
```

### 2단계: Vercel 배포

```bash
# 프로덕션 배포
vercel --prod
```

### 3단계: 배포 확인

```bash
# Health check 확인
curl https://your-backend-name.vercel.app/health

# 예상 응답: {"status":"ok"}
```

### 4단계: API 엔드포인트 테스트

```bash
# Swagger 문서 확인
# 브라우저에서: https://your-backend-name.vercel.app/api/docs

# 회원가입 테스트
curl -X POST https://your-backend-name.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","nickname":"테스터"}'
```

---

## 🚀 DEPLOY-3: 프론트엔드 배포

### 1단계: 환경 변수 업데이트

**중요**: 백엔드 배포 완료 후 실제 URL로 업데이트

```bash
cd frontend

# .env 파일 업데이트
echo "VITE_API_BASE_URL=https://your-backend-name.vercel.app/api" > .env
```

또는 Vercel 대시보드에서:
1. 프로젝트 선택 → Settings → Environment Variables
2. `VITE_API_BASE_URL` 값 변경
3. Redeploy 필요

### 2단계: 빌드 테스트

```bash
# 프로덕션 빌드 테스트
npm run build

# dist 폴더 생성 확인
ls -la dist
```

### 3단계: Vercel 배포

```bash
# 프로덕션 배포
vercel --prod
```

### 4단계: 배포 확인

브라우저에서 확인:
- `https://your-frontend-name.vercel.app`
- 회원가입 페이지 로드 확인
- 로그인 기능 확인

---

## 🚀 DEPLOY-4: Production 통합 테스트

### 테스트 시나리오

#### 1. 인증 플로우
- [ ] 회원가입 성공
- [ ] 로그인 성공
- [ ] 토큰 갱신 확인
- [ ] 로그아웃 확인

#### 2. Todo CRUD
- [ ] 할일 생성 (마감일 포함)
- [ ] 할일 목록 조회
- [ ] 할일 수정
- [ ] 할일 완료
- [ ] 할일 삭제

#### 3. 필터 및 정렬
- [ ] 상태 필터 (진행 중, 완료됨)
- [ ] 우선순위 필터
- [ ] 정렬 기능 (생성일, 마감일)

#### 4. 캘린더
- [ ] 캘린더 페이지 로드
- [ ] 공휴일 표시 (고정 공휴일만)
- [ ] 할일 마감일 표시 (파란 점)
- [ ] 이전/다음 월 네비게이션

#### 5. 휴지통
- [ ] 삭제된 할일 조회
- [ ] 할일 복원
- [ ] 페이지네이션

### 성능 측정

```bash
# Lighthouse 성능 점수 측정
npx lighthouse https://your-frontend-name.vercel.app --view

# 목표:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

### 모바일 테스트

- [ ] iOS Safari 테스트
- [ ] Android Chrome 테스트
- [ ] 반응형 레이아웃 확인

---

## 🔧 트러블슈팅

### 문제 1: CORS 에러

**증상**: 프론트엔드에서 API 호출 시 CORS 에러 발생

**해결**:
1. Backend `_lib/middleware/cors.js` 확인
2. Vercel 환경 변수에 `ALLOWED_ORIGINS` 추가
3. 프론트엔드 도메인을 CORS 허용 목록에 추가

### 문제 2: 환경 변수 인식 안 됨

**증상**: `import.meta.env.VITE_API_BASE_URL` 값이 `undefined`

**해결**:
1. Vercel 대시보드에서 환경 변수 확인
2. 변수 이름이 `VITE_` 접두사로 시작하는지 확인
3. Redeploy 필요

### 문제 3: Database 연결 실패

**증상**: 500 에러 발생, 로그에 PostgreSQL 연결 오류

**해결**:
1. Supabase 대시보드에서 연결 문자열 확인
2. Vercel 환경 변수 `POSTGRES_CONNECTION_STRING` 값 재확인
3. Supabase Pooler 사용 (`:6543` 포트)

### 문제 4: Serverless Function Timeout

**증상**: 10초 후 타임아웃 에러

**해결**:
1. DB 쿼리 최적화
2. 인덱스 추가 (특히 `user_id`, `status`, `due_date`)
3. Vercel Pro 플랜으로 업그레이드 (60초 타임아웃)

---

## 📊 배포 후 모니터링

### Vercel Analytics 활성화

1. Vercel 대시보드 → 프로젝트 선택
2. Analytics 탭
3. Enable Analytics

### 로그 확인

```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 배포의 로그
vercel logs [deployment-url]
```

### 에러 트래킹

- Vercel 대시보드 → Functions → Error Rate 확인
- 500 에러 발생 시 로그 확인

---

## ✅ 배포 완료 체크리스트

- [ ] Backend Vercel 배포 성공
- [ ] Frontend Vercel 배포 성공
- [ ] 모든 API 엔드포인트 정상 작동
- [ ] 회원가입/로그인 정상
- [ ] Todo CRUD 정상
- [ ] 캘린더 정상 표시
- [ ] 휴지통 정상 작동
- [ ] 모바일 디바이스 테스트 완료
- [ ] 성능 점수 목표 달성 (Lighthouse > 90)

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/build.html)
- [Express Serverless 배포](https://vercel.com/guides/using-express-with-vercel)
- [Supabase 연결 문자열](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

**다음 단계**: DEPLOY-2 (백엔드 배포) 진행
