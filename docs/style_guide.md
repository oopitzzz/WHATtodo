# WHATtodo 스타일 가이드

## 1. 색상 팔레트

### 주색상
- **Primary Blue**: `#3B82F6` - 주요 액션 (버튼, 링크)
- **Secondary Gray**: `#6B7280` - 보조 텍스트
- **Background**: `#F3F4F6` - 페이지 배경

### 상태별 색상
- **Success (완료)**: `#10B981` - 녹색
- **Warning (주의)**: `#F59E0B` - 주황색
- **Error (오류)**: `#EF4444` - 빨강색
- **Info (정보)**: `#06B6D4` - 청록색

### 우선순위별 색상
- **High (높음)**: `#EF4444` - 빨강색
- **Normal (중간)**: `#3B82F6` - 파랑색
- **Low (낮음)**: `#9CA3AF` - 회색

## 2. 타이포그래피

### 폰트 설정
- **Font Family**: System UI (system-ui, Avenir, Helvetica, Arial, sans-serif)
- **기본 크기**: 16px (body)
- **라인 높이**: 1.5

### 텍스트 스타일
- **H1**: 32px, Bold (2rem, font-bold)
- **H2**: 24px, Bold (1.5rem, font-bold)
- **H3**: 20px, Bold (1.25rem, font-bold)
- **Body**: 16px, Regular (1rem, font-normal)
- **Caption**: 14px, Regular (0.875rem, font-normal)
- **Small**: 12px, Regular (0.75rem, font-normal)

## 3. 버튼 스타일

### 크기
- **Small**: px-3 py-1 text-sm
- **Medium**: px-4 py-2 text-base (기본)
- **Large**: px-6 py-3 text-lg

### 상태별 스타일
- **Primary**: 파랑 배경, 흰색 텍스트
- **Secondary**: 회색 배경, 검정 텍스트
- **Danger**: 빨강 배경, 흰색 텍스트

### 상호작용
- **Hover**: 색상 진하게
- **Active**: 색상 더욱 진하게
- **Disabled**: 밝아지고 커서 변경
- **Loading**: 스피너 애니메이션 + 비활성화

## 4. 입력 필드

### 스타일
- **Border**: 2px 회색 (focus 시 파랑)
- **Padding**: 8px 16px (py-2 px-4)
- **Border Radius**: 8px (rounded-lg)
- **Focus**: 파랑 테두리 + 약간의 그림자

### 에러 상태
- **Border**: 2px 빨강
- **Background**: 연한 빨강 (#FEE2E2)
- **Text**: 빨강 (#DC2626)

## 5. 카드 & 레이아웃

### 카드
- **Padding**: 16px (p-4) 또는 24px (p-6)
- **Border Radius**: 8px 또는 12px
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1)
- **Hover**: 약간의 shadow 증가 + scale 변화

### 간격
- **XS**: 4px (0.25rem)
- **SM**: 8px (0.5rem)
- **MD**: 16px (1rem)
- **LG**: 24px (1.5rem)
- **XL**: 32px (2rem)

## 6. 아이콘 & 이미지

### 아이콘
- **크기**: 16px, 20px, 24px, 32px
- **색상**: 주변 텍스트와 동일
- **Hover**: 약간의 색상 변화

### 이미지
- **Border Radius**: 8px
- **Max Width**: 100%
- **Aspect Ratio**: 유지

## 7. 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px (375px 기준)
- **Tablet**: 768px ~ 1024px
- **Desktop**: > 1024px

### 레이아웃 원칙
- **Mobile First**: 모바일부터 시작
- **Flex Layout**: 주로 flexbox 사용
- **Grid**: 복잡한 레이아웃은 grid 사용
- **Padding**: Mobile 16px, Tablet 24px, Desktop 32px

## 8. 애니메이션

### 전환 시간
- **Fast**: 150ms - 아주 빠른 상호작용
- **Normal**: 300ms - 일반적인 전환
- **Slow**: 500ms - 부드러운 열기/닫기

### 이징 함수
- **기본**: ease-in-out
- **입장**: ease-out
- **퇴장**: ease-in

## 9. 접근성 (A11y)

### 색상 대비
- **텍스트**: WCAG AA 기준 이상 (4.5:1 비율)
- **UI 요소**: WCAG AA 기준 (3:1 비율)

### 포커스 상태
- **outline**: 2px solid focus ring color
- **outline-offset**: 2px

### 라벨
- 모든 입력 필드에 명시적 라벨
- Hidden label 사용 가능 (screen reader용)

## 10. 다크모드 (향후)

### 색상 스킴
- **배경**: #1F2937 (dark-gray-800)
- **텍스트**: #F3F4F6 (light-gray-100)
- **카드**: #111827 (dark-gray-900)

---

## Tailwind CSS 클래스 가이드

### 자주 사용하는 조합
```jsx
// 버튼
"px-4 py-2 rounded-lg font-medium transition-colors duration-200"

// 카드
"bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"

// 텍스트 입력
"px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"

// 플렉스 센터
"flex items-center justify-center"

// 그리드
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

---

## 개발자 체크리스트

- [ ] 색상은 팔레트에서만 사용
- [ ] 타이포그래피는 정의된 크기만 사용
- [ ] 버튼과 입력 필드는 예시 컴포넌트 사용
- [ ] 반응형 디자인은 Mobile First 원칙 준수
- [ ] 애니메이션은 정의된 시간 사용
- [ ] 접근성 체크: 색상 대비, 포커스, 라벨
- [ ] Tailwind CSS만 사용 (inline CSS 금지)
