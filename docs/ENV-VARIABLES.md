# WHATtodo 환경 변수 설정 가이드

**작성일**: 2025-11-28

---

## 🔐 Backend 환경 변수

### Vercel Dashboard에서 설정할 환경 변수

1. **POSTGRES_CONNECTION_STRING** (필수)
   ```
   postgresql://postgres.dqhvtmphokkfocxeyjur:MzueBPVlp9ptYQNC@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
   - Supabase PostgreSQL 연결 문자열
   - Pooler 포트 사용 (6543)

2. **ACCESS_TOKEN_SECRET** (필수)
   ```bash
   # 강력한 랜덤 문자열 생성
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   - JWT Access Token 서명 키
   - ⚠️ 프로덕션에서는 반드시 강력한 랜덤 문자열 사용
   - 로컬 개발: `access-secret-key` (개발용만)

3. **REFRESH_TOKEN_SECRET** (필수)
   ```bash
   # 강력한 랜덤 문자열 생성
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   - JWT Refresh Token 서명 키
   - ⚠️ ACCESS_TOKEN_SECRET와 다른 값 사용
   - 로컬 개발: `refresh-secret-key` (개발용만)

4. **NODE_ENV** (권장)
   ```
   production
   ```
   - 환경 설정
   - Vercel에서는 자동으로 `production` 설정됨

---

## 🌐 Frontend 환경 변수

### Vercel Dashboard에서 설정할 환경 변수

1. **VITE_API_BASE_URL** (필수)
   ```
   https://your-backend-name.vercel.app/api
   ```
   - 백엔드 API URL
   - ⚠️ **중요**: 백엔드 배포 완료 후 실제 Vercel URL로 변경
   - 로컬 개발: `http://localhost:3000/api`

### 백엔드 URL 확인 방법

```bash
# 백엔드 배포 후 URL 확인
cd backend
vercel --prod

# 출력 예시:
# ✅ Production: https://whattodo-backend.vercel.app
```

그 후 프론트엔드 환경 변수 업데이트:
```bash
cd ../frontend
vercel env add VITE_API_BASE_URL production
# 값 입력: https://whattodo-backend.vercel.app/api
```

---

## 📝 Vercel CLI로 환경 변수 설정

### Backend 설정

```bash
cd backend

# Vercel 프로젝트 연결 (최초 1회)
vercel link

# 환경 변수 추가
vercel env add POSTGRES_CONNECTION_STRING production
vercel env add ACCESS_TOKEN_SECRET production
vercel env add REFRESH_TOKEN_SECRET production
vercel env add NODE_ENV production

# 환경 변수 확인
vercel env ls
```

### Frontend 설정

```bash
cd frontend

# Vercel 프로젝트 연결 (최초 1회)
vercel link

# 환경 변수 추가
vercel env add VITE_API_BASE_URL production

# 환경 변수 확인
vercel env ls
```

---

## 🖥️ Vercel Dashboard에서 설정

### 방법 1: Dashboard UI 사용

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 (backend 또는 frontend)
3. **Settings** → **Environment Variables**
4. **Add Variable** 클릭
5. 변수명과 값 입력
6. Environment 선택: **Production**
7. **Save** 클릭

### 방법 2: 기존 환경 변수 수정

1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. 수정할 변수의 **Edit** 버튼 클릭
3. 값 변경 후 **Save**
4. ⚠️ **Redeploy 필요**: Deployments 탭 → 최신 배포 → **Redeploy**

---

## 🔍 환경 변수 확인

### Backend

```bash
# Health check
curl https://your-backend-name.vercel.app/health

# 응답: {"status":"ok"}
```

### Frontend

브라우저 콘솔에서:
```javascript
// API Base URL 확인
console.log(import.meta.env.VITE_API_BASE_URL)
```

---

## ⚠️ 보안 주의사항

1. **절대 코드에 하드코딩하지 말 것**
   - ❌ `const secret = "access-secret-key"`
   - ✅ `const secret = process.env.ACCESS_TOKEN_SECRET`

2. **Git에 커밋하지 말 것**
   - `.env` 파일은 `.gitignore`에 포함됨
   - ✅ 이미 설정 완료

3. **프로덕션과 개발 환경 분리**
   - 개발: `.env` 파일 사용
   - 프로덕션: Vercel 환경 변수 사용

4. **시크릿 키 강도**
   - 최소 64바이트 (128자) 랜덤 문자열
   - 영문, 숫자, 특수문자 혼합

---

## 📋 체크리스트

### Backend 환경 변수
- [ ] `POSTGRES_CONNECTION_STRING` - Supabase 연결 문자열
- [ ] `ACCESS_TOKEN_SECRET` - 강력한 랜덤 문자열
- [ ] `REFRESH_TOKEN_SECRET` - ACCESS_TOKEN_SECRET와 다른 값
- [ ] `NODE_ENV` - `production`

### Frontend 환경 변수
- [ ] `VITE_API_BASE_URL` - 백엔드 Vercel URL

### 확인 사항
- [ ] 모든 환경 변수가 Vercel Dashboard에 추가됨
- [ ] 시크릿 키가 강력한 랜덤 문자열임
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 프론트엔드 API URL이 백엔드 URL과 일치함

---

## 🔧 문제 해결

### 문제: 환경 변수가 인식되지 않음

**해결 방법**:
1. Vercel Dashboard에서 변수 확인
2. Redeploy 수행
3. 로그 확인: `vercel logs --follow`

### 문제: Database 연결 실패

**해결 방법**:
1. Supabase Dashboard → Settings → Database → Connection Pooling
2. Pooler 연결 문자열 복사 (포트 6543)
3. Vercel 환경 변수 업데이트
4. Redeploy

### 문제: CORS 에러

**해결 방법**:
1. Backend `_lib/middleware/cors.js` 확인
2. 프론트엔드 도메인이 허용 목록에 있는지 확인
3. Vercel 환경 변수에 `ALLOWED_ORIGINS` 추가 (필요시)

---

**다음 단계**: `DEPLOY-GUIDE.md` 참고하여 배포 진행
