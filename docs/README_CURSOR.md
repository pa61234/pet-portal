# Pet-Portal · README_CURSOR.md
> Coding용 핵심 정보 (Day-1 ~ Day-3 완료 범위)

## 1. 프로젝트 상태 ✅

| 항목 | 상태 | 완료일 |
|------|------|--------|
| Firebase Functions | ✅ 완료 | Day-1 |
| PWA Frontend | ✅ 완료 | Day-3 |
| Sharetribe 연동 | ✅ 완료 | Day-1 |
| Toss Payments | ✅ 완료 | Day-2 |
| RFID 모듈 | ✅ 완료 | Day-3 |

## 2. Sharetribe Flex

| 항목 | 값 |
|------|----|
| Console URL | https://flex-console.sharetribe.com/pet-portal |
| Marketplace slug | pet-portal |
| Contact email | support@pet-portal.com |
| Dummy listing URL | https://pet-portal.sharetribe.com/l/<LISTING_ID> |
| Webhook URL | https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/sharetribeWebhook |

## 3. 환경 변수 설정

프로젝트를 실행하기 전에 `.env` 파일을 생성하고 필요한 환경 변수를 설정해야 합니다.

```bash
# .env 파일 생성
touch .env

# .env 파일 편집
```

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

## 4. 개발 서버 실행

```bash
# 전체 에뮬레이터 실행
npm run dev

# 또는 개별 실행
npm run dev:hosting    # PWA만
npm run dev:functions  # Functions만
```

## 5. PWA Frontend 구조

```
public/
├── index.html              # 메인 HTML
├── manifest.json           # PWA 매니페스트
├── sw.js                   # Service Worker
├── styles/
│   └── main.css           # 메인 스타일시트
├── js/
│   ├── app.js             # 메인 애플리케이션
│   └── firebase-config.js # Firebase 설정
├── images/                # 이미지 파일들
└── icons/                 # PWA 아이콘들
```

### 주요 라우트
- `/` - 홈 (검색 + 목록)
- `/l/:id` - 서비스 상세
- `/checkout` - 결제 페이지
- `/tracking/:txId` - 추적 페이지
- `/admin/dashboard` - 관리자 대시보드

## 6. Cloud Functions

### 구현된 함수들
1. **sharetribeWebhook** - Sharetribe 이벤트 수신
2. **tossWebhook** - Toss 결제 완료 처리
3. **rfidUpdate** - RFID 스캔 상태 업데이트

### 배포된 URL들
- Sharetribe Webhook: `https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/sharetribeWebhook`
- Toss Webhook: `https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/tossWebhook`
- RFID Update: `https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/rfidUpdate`

## 7. API 키 설정

### Sharetribe API
- Client ID와 Secret Key는 `.env` 파일에 설정
- Console에서 API 키 확인: https://flex-console.sharetribe.com/pet-portal

### Toss API
- Client Key와 Secret Key는 `.env` 파일에 설정
- 테스트 키와 실제 키를 구분하여 사용
- Webhook URL 설정 필요

### Firebase
- 프로젝트 ID: `pet-portal-mvp`
- 리전: `asia-northeast3` (서울)

## 8. 배포 명령어

```bash
# 전체 배포
npm run deploy

# 개별 배포
npm run deploy:hosting    # PWA만
npm run deploy:functions  # Functions만

# 로그 확인
npm run logs
npm run logs:tail
```

## 9. 테스트 방법

### 로컬 테스트
```bash
# PWA 테스트
npm run dev:hosting

# Functions 테스트
npm run dev:functions
```

### API 테스트
```bash
# Toss Webhook 테스트
curl -X POST https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/tossWebhook \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE","orderId":"test_tx_123"}'

# RFID Update 테스트
curl -X POST https://asia-northeast3-pet-portal-mvp.cloudfunctions.net/rfidUpdate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token" \
  -d '{"txId":"test_tx_123","rfidTag":"RFID001","status":"pickup_started"}'
```

## 10. 다음 단계 (W3-W8)

### W3: RFID + CCTV 모듈 MVP
- [ ] RFID 하드웨어 연동
- [ ] CCTV 스트리밍 기능
- [ ] SaaS 대시보드 v1

### W4: 인증 SOP v0.1
- [ ] 표준 운영 절차 문서화
- [ ] 첫 번째 파트너 온보딩

### W5: 소유자 추적 PWA
- [ ] React 기반 PWA
- [ ] FCM 푸시 알림

### W6: Aquamation 샌드박스
- [ ] 친환경 장례 서비스 문서
- [ ] ESG 랜딩 페이지

### W7: QA 도구
- [ ] 자동화된 NPS 수집
- [ ] 품질 관리 도구

### W8: 공개 베타
- [ ] 200개 이상 예약 목표
- [ ] 프로덕션 환경 안정화

## 11. 참고 자료

| 문서 | URL |
|------|-----|
| Sharetribe Flex docs | https://www.sharetribe.com/developers/ |
| Toss Payments dev | https://developers.tosspayments.com/ |
| 21 Gram (Angelpaw) | https://angelpaw.com/ |
| Pet Passages | https://www.petpassages.com/ |
| Firebase docs | https://firebase.google.com/docs |
| PWA docs | https://web.dev/progressive-web-apps/ |

---

> **핀 고정**: 이 파일을 Cursor AI Docs에 핀하여 모든 엔지니어가 동일한 컨텍스트를 공유하세요.
