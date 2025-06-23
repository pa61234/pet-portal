# Pet-Portal 🐾 - 반려동물 장례 서비스 마켓플레이스

> 전국 반려동물 장례 서비스 마켓플레이스 (검색 → 예약 → 결제 → 실시간 추적)

## 📋 프로젝트 개요

Pet-Portal은 반려동물 장례 서비스를 위한 종합 마켓플레이스입니다. 반려동물 주인, 화장소, 수의사 클리닉을 연결하여 투명하고 신뢰할 수 있는 서비스를 제공합니다.

### 주요 기능
- 🔍 **서비스 검색**: 지역, 가격대, 서비스 유형별 검색
- 📱 **PWA**: 모바일 최적화된 Progressive Web App
- 💳 **결제 시스템**: Toss Payments 연동
- 📍 **실시간 추적**: RFID 기반 서비스 진행 상황 추적
- 🔔 **푸시 알림**: FCM을 통한 실시간 알림
- 📊 **관리자 대시보드**: SaaS 기반 관리 도구

## 🏗️ 시스템 아키텍처

```
[Owner PWA] ─╮                 ╭─> Firebase Firestore (tx status)
[Admin SaaS]─┼─> Cloud Functions ┼─> Toss Payments  (card auth)
[RFID App] ─╯                 ╰─> Sharetribe Flex (listing / tx)
```

### 기술 스택
- **Frontend**: Vanilla JavaScript PWA
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firebase Firestore
- **Payments**: Toss Payments
- **Marketplace**: Sharetribe Flex
- **Hosting**: Firebase Hosting + Cloudflare CDN
- **Notifications**: Firebase Cloud Messaging (FCM)

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd pet-portal

# Firebase CLI 설치 (전역)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 설정
firebase use pet-portal-mvp
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Firebase
PROJECT_ID=pet-portal-mvp

# Sharetribe Flex
SHARETRIBE_CLIENT_ID=your_client_id_here
SHARETRIBE_CLIENT_SECRET=your_client_secret_here

# Toss Payments
TOSS_CLIENT_KEY=your_toss_client_key_here
TOSS_SECRET_KEY=your_toss_secret_key_here
TOSS_VERIFY_KEY=your_toss_verify_key_here

# Kakao (선택사항)
KAKAO_REST_API_KEY=your_kakao_api_key_here
```

### 3. 의존성 설치

```bash
# Cloud Functions 의존성 설치
cd functions
npm install

# 빌드
npm run build
```

### 4. 로컬 개발 서버 실행

```bash
# Firebase 에뮬레이터 실행
firebase emulators:start

# 또는 Functions만 실행
cd functions
npm run serve
```

### 5. 배포

```bash
# 전체 배포
firebase deploy

# Functions만 배포
firebase deploy --only functions

# Hosting만 배포
firebase deploy --only hosting
```

## 📁 프로젝트 구조

```
pet-portal/
├── public/                     # PWA Frontend
│   ├── index.html             # 메인 HTML
│   ├── manifest.json          # PWA 매니페스트
│   ├── sw.js                  # Service Worker
│   ├── styles/
│   │   └── main.css          # 메인 스타일시트
│   ├── js/
│   │   ├── app.js            # 메인 애플리케이션
│   │   └── firebase-config.js # Firebase 설정
│   ├── images/               # 이미지 파일들
│   └── icons/                # PWA 아이콘들
├── functions/                 # Cloud Functions
│   ├── src/
│   │   └── index.ts          # 메인 함수들
│   ├── package.json
│   └── tsconfig.json
├── docs/                      # 문서
├── api_keys/                  # API 키 (gitignored)
├── costs/                     # 비용 분석
├── firebase.json             # Firebase 설정
└── .firebaserc               # Firebase 프로젝트 설정
```

## 🔧 주요 기능 설명

### 1. 라우팅 시스템

| 경로 | 컴포넌트 | API |
|------|----------|-----|
| `/` | SearchBar, ListingCard | `GET /listings?bounds…` |
| `/l/:id` | Gallery, ReserveSheet | `POST /transactions/transition/initiate` |
| `/checkout` | TossWidget, OrderSummary | `requestPayment()` |
| `/tracking/:txId` | StatusTimeline, MapTracker | Firestore realtime |
| `/admin/dashboard` | TodayPickupTable, RFIDScan | `PUT /tx/:id/status` |

### 2. Cloud Functions

| 함수 | 트리거 | 목적 |
|------|--------|------|
| `sharetribeWebhook` | HTTPS | Sharetribe 이벤트 수신 |
| `tossWebhook` | HTTPS | 결제 완료 시 트랜잭션 상태 변경 |
| `rfidUpdate` | HTTPS | RFID 스캔 시 상태 업데이트 |

### 3. PWA 기능

- **오프라인 지원**: Service Worker를 통한 캐싱
- **푸시 알림**: FCM을 통한 실시간 알림
- **홈 화면 추가**: 모바일에서 앱처럼 사용 가능
- **반응형 디자인**: 모든 디바이스에서 최적화

## 🔌 API 연동

### Sharetribe Flex
- **Console**: https://flex-console.sharetribe.com/pet-portal
- **Marketplace**: https://pet-portal.sharetribe.com
- **Webhook URL**: `https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/sharetribeWebhook`

### Toss Payments
- **Webhook URL**: `https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/tossWebhook`
- **테스트 모드**: 개발 시 테스트 키 사용

### Firebase
- **프로젝트 ID**: `pet-portal-mvp`
- **리전**: `asia-northeast3` (서울)

## 📱 PWA 배포

### 1. 빌드 및 배포

```bash
# Firebase Hosting에 배포
firebase deploy --only hosting

# Cloudflare CDN 연동 (선택사항)
# Cloudflare 대시보드에서 DNS 설정
```

### 2. 도메인 설정

```bash
# 커스텀 도메인 설정
firebase hosting:channel:deploy production
firebase hosting:sites:add your-domain.com
```

## 🔒 보안 고려사항

- API 키는 절대 Git에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- 프로덕션 환경에서는 적절한 인증 메커니즘을 구현하세요
- CORS 설정을 적절히 구성하세요

## 🧪 테스트

### 로컬 테스트

```bash
# Functions 테스트
cd functions
npm test

# PWA 테스트
firebase emulators:start --only hosting
```

### API 테스트

```bash
# Webhook 테스트
curl -X POST https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/tossWebhook \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE","orderId":"test_tx_123"}'
```

## 📊 모니터링

### Firebase Console
- **Functions**: https://console.firebase.google.com/project/pet-portal-mvp/functions
- **Firestore**: https://console.firebase.google.com/project/pet-portal-mvp/firestore
- **Hosting**: https://console.firebase.google.com/project/pet-portal-mvp/hosting

### 로그 확인

```bash
# Functions 로그
firebase functions:log

# 실시간 로그
firebase functions:log --tail
```

## 🚀 배포 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] API 키 설정 완료
- [ ] Functions 빌드 성공
- [ ] PWA 아이콘 파일 준비
- [ ] 도메인 SSL 인증서 설정
- [ ] Webhook URL 설정
- [ ] 테스트 완료

## 📞 지원

- **이슈 리포트**: GitHub Issues 사용
- **문서**: `/docs` 폴더 참조
- **개발 가이드**: Cursor AI Docs에 핀된 참조 문서 확인

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**Pet-Portal Team** 🐾  
*반려동물과 함께하는 마지막 여정을 위한 서비스* 