# FASD 아키텍처 마이그레이션 구현 계획

PetLog 프론트엔드를 **Hybrid FASD (Feature-App-Shared-Design)** 구조로 재구성하여 MSA 스타일의 유지보수성과 백엔드 연동 유연성을 확보합니다.

## 현재 구조 분석

```
src/
├── App.tsx           # 라우팅 및 프로바이더 설정
├── main.tsx          # 엔트리 포인트
├── components/       # 79개 파일 (UI + 도메인 혼합)
│   ├── ui/           # 57개 shadcn/ui 컴포넌트
│   ├── shop/         # 5개 쇼핑 컴포넌트
│   └── *.tsx         # 16개 기타 컴포넌트
├── pages/            # 54개 페이지 파일
├── lib/              # 8개 유틸리티/API 파일
└── hooks/            # 2개 공통 훅
```

> [!WARNING]
> 현재 구조의 문제점:
> - 도메인 간 코드가 섞여 있어 특정 기능 수정 시 여러 폴더를 탐색해야 함
> - API 로직과 UI가 분리되어 있어 백엔드 연동 시 추적이 어려움
> - 팀원 간 코드 충돌 가능성 높음

---

## 제안하는 FASD 구조

```
src/
├── app/                      # (App) 앱 설정 및 라우팅
│   ├── App.tsx               # 라우터 + 프로바이더
│   ├── main.tsx              # 엔트리 포인트
│   └── routes.tsx            # 라우트 정의 (선택)
│
├── shared/                   # (Shared) 공통 모듈
│   ├── ui/                   # shadcn/ui 컴포넌트 (57개)
│   ├── lib/                  # 유틸리티 (utils.ts)
│   ├── hooks/                # 공통 훅 (use-mobile, use-toast)
│   └── components/           # 공통 레이아웃 (Header, Logo)
│
├── features/                 # (Feature) 도메인별 기능 모듈
│   ├── auth/                 # 인증/사용자
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── pages/
│   ├── diary/                # AI 다이어리/리캡
│   ├── healthcare/           # 건강 관리
│   ├── shop/                 # 쇼핑몰
│   ├── petmate/              # 펫메이트/산책메이트
│   ├── social/               # 피드/탐색
│   └── chatbot/              # 챗봇
│
└── pages/                    # (Pages) 라우트 페이지 (features 조립)
```

---

## Proposed Changes

### App 모듈 (앱 설정)

#### [MODIFY] [App.tsx](file:///c:/Final_Project/Frontend/src/App.tsx)
- `src/app/App.tsx`로 이동
- Import 경로를 새 구조에 맞게 업데이트

#### [MODIFY] [main.tsx](file:///c:/Final_Project/Frontend/src/main.tsx)
- `src/app/main.tsx`로 이동

---

### Shared 모듈 (공통 컴포넌트)

#### [MOVE] `components/ui/*` → `shared/ui/`
57개 shadcn/ui 컴포넌트를 공통 UI 폴더로 이동

#### [MOVE] [lib/utils.ts](file:///c:/Final_Project/Frontend/src/lib/utils.ts) → `shared/lib/utils.ts`
유틸리티 함수 이동

#### [MOVE] `hooks/*` → `shared/hooks/`
- [use-mobile.ts](file:///c:/Final_Project/Frontend/src/hooks/use-mobile.ts)
- [use-toast.ts](file:///c:/Final_Project/Frontend/src/hooks/use-toast.ts)

#### [MOVE] 공통 레이아웃 컴포넌트 → `shared/components/`
- [header.tsx](file:///c:/Final_Project/Frontend/src/components/header.tsx)
- [logo.tsx](file:///c:/Final_Project/Frontend/src/components/logo.tsx)
- [tab-navigation.tsx](file:///c:/Final_Project/Frontend/src/components/tab-navigation.tsx)
- [theme-provider.tsx](file:///c:/Final_Project/Frontend/src/components/theme-provider.tsx)

---

### Features/Auth 모듈 (인증)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| Context | [lib/auth-context.tsx](file:///c:/Final_Project/Frontend/src/lib/auth-context.tsx) | `features/auth/context/auth-context.tsx` |
| Pages | [pages/LoginPage.tsx](file:///c:/Final_Project/Frontend/src/pages/LoginPage.tsx) | `features/auth/pages/LoginPage.tsx` |
| | [pages/SignupPage.tsx](file:///c:/Final_Project/Frontend/src/pages/SignupPage.tsx) | `features/auth/pages/SignupPage.tsx` |
| | [pages/SignupIndexPage.tsx](file:///c:/Final_Project/Frontend/src/pages/SignupIndexPage.tsx) | `features/auth/pages/SignupIndexPage.tsx` |
| | [pages/SignupInfoPage.tsx](file:///c:/Final_Project/Frontend/src/pages/SignupInfoPage.tsx) | `features/auth/pages/SignupInfoPage.tsx` |
| | [pages/OnboardingPage.tsx](file:///c:/Final_Project/Frontend/src/pages/OnboardingPage.tsx) | `features/auth/pages/OnboardingPage.tsx` |
| | [pages/WelcomePage.tsx](file:///c:/Final_Project/Frontend/src/pages/WelcomePage.tsx) | `features/auth/pages/WelcomePage.tsx` |
| | [pages/UserInfoPage.tsx](file:///c:/Final_Project/Frontend/src/pages/UserInfoPage.tsx) | `features/auth/pages/UserInfoPage.tsx` |
| | [pages/SettingsPage.tsx](file:///c:/Final_Project/Frontend/src/pages/SettingsPage.tsx) | `features/auth/pages/SettingsPage.tsx` |

---

### Features/Diary 모듈 (AI 다이어리)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| Components | [components/diary-carousel-3d.tsx](file:///c:/Final_Project/Frontend/src/components/diary-carousel-3d.tsx) | `features/diary/components/diary-carousel-3d.tsx` |
| | [components/recap-modal.tsx](file:///c:/Final_Project/Frontend/src/components/recap-modal.tsx) | `features/diary/components/recap-modal.tsx` |
| | [components/recap-generation-animation.tsx](file:///c:/Final_Project/Frontend/src/components/recap-generation-animation.tsx) | `features/diary/components/recap-generation-animation.tsx` |
| Data | [lib/recap-data.ts](file:///c:/Final_Project/Frontend/src/lib/recap-data.ts) | `features/diary/data/recap-data.ts` |
| Pages | [pages/AiDiaryPage.tsx](file:///c:/Final_Project/Frontend/src/pages/AiDiaryPage.tsx) | `features/diary/pages/AiDiaryPage.tsx` |
| | [pages/AiStudioPage.tsx](file:///c:/Final_Project/Frontend/src/pages/AiStudioPage.tsx) | `features/diary/pages/AiStudioPage.tsx` |
| | [pages/AiRecapPage.tsx](file:///c:/Final_Project/Frontend/src/pages/AiRecapPage.tsx) | `features/diary/pages/AiRecapPage.tsx` |
| | [pages/AiBiographyPage.tsx](file:///c:/Final_Project/Frontend/src/pages/AiBiographyPage.tsx) | `features/diary/pages/AiBiographyPage.tsx` |
| | [pages/GalleryPage.tsx](file:///c:/Final_Project/Frontend/src/pages/GalleryPage.tsx) | `features/diary/pages/GalleryPage.tsx` |
| | [pages/PortfolioPage.tsx](file:///c:/Final_Project/Frontend/src/pages/PortfolioPage.tsx) | `features/diary/pages/PortfolioPage.tsx` |

---

### Features/Healthcare 모듈 (건강 관리)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| Data | [lib/pet-data.ts](file:///c:/Final_Project/Frontend/src/lib/pet-data.ts) | `features/healthcare/data/pet-data.ts` |
| Pages | [pages/HealthcarePage.tsx](file:///c:/Final_Project/Frontend/src/pages/HealthcarePage.tsx) | `features/healthcare/pages/HealthcarePage.tsx` |
| | [pages/DashboardPage.tsx](file:///c:/Final_Project/Frontend/src/pages/DashboardPage.tsx) | `features/healthcare/pages/DashboardPage.tsx` |
| | [pages/PetInfoPage.tsx](file:///c:/Final_Project/Frontend/src/pages/PetInfoPage.tsx) | `features/healthcare/pages/PetInfoPage.tsx` |
| | [pages/PetProfilePage.tsx](file:///c:/Final_Project/Frontend/src/pages/PetProfilePage.tsx) | `features/healthcare/pages/PetProfilePage.tsx` |
| | [pages/PetEditPage.tsx](file:///c:/Final_Project/Frontend/src/pages/PetEditPage.tsx) | `features/healthcare/pages/PetEditPage.tsx` |
| | [pages/RegisterPetPage.tsx](file:///c:/Final_Project/Frontend/src/pages/RegisterPetPage.tsx) | `features/healthcare/pages/RegisterPetPage.tsx` |

---

### Features/Shop 모듈 (쇼핑몰)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| Context | [components/shop/cart-context.tsx](file:///c:/Final_Project/Frontend/src/components/shop/cart-context.tsx) | `features/shop/context/cart-context.tsx` |
| | [components/shop/wishlist-context.tsx](file:///c:/Final_Project/Frontend/src/components/shop/wishlist-context.tsx) | `features/shop/context/wishlist-context.tsx` |
| Components | [components/shop/cart-item.tsx](file:///c:/Final_Project/Frontend/src/components/shop/cart-item.tsx) | `features/shop/components/cart-item.tsx` |
| | [components/shop/category-filter.tsx](file:///c:/Final_Project/Frontend/src/components/shop/category-filter.tsx) | `features/shop/components/category-filter.tsx` |
| | [components/shop/product-card.tsx](file:///c:/Final_Project/Frontend/src/components/shop/product-card.tsx) | `features/shop/components/product-card.tsx` |
| | [components/product-card.tsx](file:///c:/Final_Project/Frontend/src/components/product-card.tsx) | `features/shop/components/product-card-simple.tsx` |
| Pages | [pages/ShopPage.tsx](file:///c:/Final_Project/Frontend/src/pages/ShopPage.tsx) | `features/shop/pages/ShopPage.tsx` |
| | [pages/CartPage.tsx](file:///c:/Final_Project/Frontend/src/pages/CartPage.tsx) | `features/shop/pages/CartPage.tsx` |
| | [pages/CheckoutPage.tsx](file:///c:/Final_Project/Frontend/src/pages/CheckoutPage.tsx) | `features/shop/pages/CheckoutPage.tsx` |
| | [pages/CheckoutCompletePage.tsx](file:///c:/Final_Project/Frontend/src/pages/CheckoutCompletePage.tsx) | `features/shop/pages/CheckoutCompletePage.tsx` |
| | [pages/ProductDetailPage.tsx](file:///c:/Final_Project/Frontend/src/pages/ProductDetailPage.tsx) | `features/shop/pages/ProductDetailPage.tsx` |
| | [pages/WishlistPage.tsx](file:///c:/Final_Project/Frontend/src/pages/WishlistPage.tsx) | `features/shop/pages/WishlistPage.tsx` |
| | [pages/MileagePage.tsx](file:///c:/Final_Project/Frontend/src/pages/MileagePage.tsx) | `features/shop/pages/MileagePage.tsx` |

---

### Features/PetMate 모듈 (펫메이트)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| API | [lib/petmate-api.ts](file:///c:/Final_Project/Frontend/src/lib/petmate-api.ts) | `features/petmate/api/petmate-api.ts` |
| Hooks | [lib/use-petmate.ts](file:///c:/Final_Project/Frontend/src/lib/use-petmate.ts) | `features/petmate/hooks/use-petmate.ts` |
| Pages | [pages/PetMatePage.tsx](file:///c:/Final_Project/Frontend/src/pages/PetMatePage.tsx) | `features/petmate/pages/PetMatePage.tsx` |
| | [pages/WalkMatePage.tsx](file:///c:/Final_Project/Frontend/src/pages/WalkMatePage.tsx) | `features/petmate/pages/WalkMatePage.tsx` |
| | [pages/MissingPetRegisterPage.tsx](file:///c:/Final_Project/Frontend/src/pages/MissingPetRegisterPage.tsx) | `features/petmate/pages/MissingPetRegisterPage.tsx` |

---

### Features/Social 모듈 (소셜/피드)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| API | [lib/message-api.ts](file:///c:/Final_Project/Frontend/src/lib/message-api.ts) | `features/social/api/message-api.ts` |
| Hooks | [lib/use-messages.ts](file:///c:/Final_Project/Frontend/src/lib/use-messages.ts) | `features/social/hooks/use-messages.ts` |
| Components | [components/post-card.tsx](file:///c:/Final_Project/Frontend/src/components/post-card.tsx) | `features/social/components/post-card.tsx` |
| | [components/user-search-modal.tsx](file:///c:/Final_Project/Frontend/src/components/user-search-modal.tsx) | `features/social/components/user-search-modal.tsx` |
| | [components/notifications-dropdown.tsx](file:///c:/Final_Project/Frontend/src/components/notifications-dropdown.tsx) | `features/social/components/notifications-dropdown.tsx` |
| Pages | [pages/FeedPage.tsx](file:///c:/Final_Project/Frontend/src/pages/FeedPage.tsx) | `features/social/pages/FeedPage.tsx` |
| | [pages/FeedAiRecommendPage.tsx](file:///c:/Final_Project/Frontend/src/pages/FeedAiRecommendPage.tsx) | `features/social/pages/FeedAiRecommendPage.tsx` |
| | [pages/FeedCreatePage.tsx](file:///c:/Final_Project/Frontend/src/pages/FeedCreatePage.tsx) | `features/social/pages/FeedCreatePage.tsx` |
| | [pages/ExplorePage.tsx](file:///c:/Final_Project/Frontend/src/pages/ExplorePage.tsx) | `features/social/pages/ExplorePage.tsx` |
| | [pages/MessagesPage.tsx](file:///c:/Final_Project/Frontend/src/pages/MessagesPage.tsx) | `features/social/pages/MessagesPage.tsx` |
| | [pages/UserPage.tsx](file:///c:/Final_Project/Frontend/src/pages/UserPage.tsx) | `features/social/pages/UserPage.tsx` |
| | [pages/ProfilePage.tsx](file:///c:/Final_Project/Frontend/src/pages/ProfilePage.tsx) | `features/social/pages/ProfilePage.tsx` |
| | [pages/CreatePage.tsx](file:///c:/Final_Project/Frontend/src/pages/CreatePage.tsx) | `features/social/pages/CreatePage.tsx` |

---

### Features/Chatbot 모듈 (챗봇)

| 파일 유형 | 현재 위치 | 이동 위치 |
|-----------|-----------|-----------|
| Components | [components/floating-chatbot-widget.tsx](file:///c:/Final_Project/Frontend/src/components/floating-chatbot-widget.tsx) | `features/chatbot/components/floating-chatbot-widget.tsx` |
| Pages | [pages/ChatbotPage.tsx](file:///c:/Final_Project/Frontend/src/pages/ChatbotPage.tsx) | `features/chatbot/pages/ChatbotPage.tsx` |

---

### 기타 컴포넌트 정리

| 파일 | 이동 위치 | 비고 |
|------|-----------|------|
| [components/landing-intro-animation.tsx](file:///c:/Final_Project/Frontend/src/components/landing-intro-animation.tsx) | `features/home/components/` | 홈 페이지 전용 |
| [components/feature-preview-animation.tsx](file:///c:/Final_Project/Frontend/src/components/feature-preview-animation.tsx) | `features/home/components/` | 홈 페이지 전용 |
| [components/event-banner-carousel.tsx](file:///c:/Final_Project/Frontend/src/components/event-banner-carousel.tsx) | `shared/components/` | 공통 캐러셀 |
| `components/3d/*` | `shared/components/3d/` | 3D 공통 컴포넌트 |

---

## Path Alias 업데이트

`tsconfig.json`에 경로 별칭 추가:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
```

---

## Verification Plan

### 빌드 테스트
```bash
cd c:\Final_Project\Frontend
pnpm run build
```
- 빌드 에러 없이 완료되어야 함

### 개발 서버 실행
```bash
cd c:\Final_Project\Frontend
pnpm run dev
```
- `http://localhost:5173`에서 정상 로딩 확인

### 수동 테스트 (브라우저)
1. 홈페이지 (`/`) 접근 확인
2. 로그인 페이지 (`/login`) 이동 확인
3. 대시보드 (`/dashboard`) 로딩 확인
4. 쇼핑몰 (`/shop`) 상품 목록 표시 확인
5. 헬스케어 (`/healthcare`) 차트 렌더링 확인
6. 각 페이지 간 네비게이션 정상 동작 확인

---

## 예상 작업 시간

| 단계 | 예상 시간 |
|------|-----------|
| 폴더 구조 생성 | 5분 |
| 파일 이동 | 20분 |
| Import 경로 수정 | 30분 |
| 테스트 및 수정 | 15분 |
| **총계** | **약 70분** |

---

## 참고: Feature 폴더 내부 컨벤션

각 feature 폴더는 다음 구조를 따릅니다:

```
features/[domain]/
├── api/           # API 호출 함수 (백엔드 연동)
├── components/    # 해당 도메인 전용 UI 컴포넌트
├── context/       # React Context (상태 관리)
├── hooks/         # 커스텀 훅
├── data/          # 목 데이터, 상수
├── pages/         # 라우트 페이지
└── index.ts       # Public exports (선택)
```

> [!TIP]  
> 이 구조의 장점:
> - **담당자 독립성**: 헬스케어 담당자는 `features/healthcare/` 폴더만 보면 됨
> - **백엔드 연동 용이**: API 파일이 도메인별로 분리되어 엔드포인트 추적 쉬움
> - **코드 충돌 최소화**: 각자 다른 feature 폴더에서 작업
<<<<<<< HEAD

## 향후 API 연동 시 사용법
1. import httpClient from '@/shared/api/http-client';

2. GET 요청
const pets = await httpClient.get<Pet[]>('/pets');

3. POST 요청
const newPet = await httpClient.post<Pet>('/pets', { name: '몽치' });
=======
>>>>>>> 3cebdbc6f965ab7269251c551dfe0d5dc8e3e733
