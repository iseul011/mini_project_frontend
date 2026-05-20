# 청소해라 자녀 Android 앱 (`com.chungsora.child`)

Flutter + Dart · **Device Owner DPC** · **AI 청소** · **PWA parity**

## Phase 6 — PWA parity · Production (완료)

- [x] 하단 탭 — 홈 · 로그 · P상점 · 나 (C-30d)
- [x] `/log` — before/after 사진 · 메시지 전송
- [x] P상점 — 보상 목록 · P 교환
- [x] 홈 — family summary · 스트릭 · 청소 CTA
- [x] unlock / 첫 로그 **축하 오버레이** (C-30e)
- [x] points API 경로 수정 (`/points/earn`, `/balance`)
- [x] [RELEASE.md](docs/RELEASE.md) — 프로덕션 가이드

## Phase 5 — 실기 E2E · 안정화

- [x] LockMonitorService · LockAlarmReceiver
- [x] [E2E_CHECKLIST.md](docs/E2E_CHECKLIST.md)

## Phase 2~4

- DPC 잠금 · AI 검증 · Vercel `/download`

## 앱 구조

```
MainShell (bottom nav)
├── 홈 — ChildHomeTab
├── 로그 — LogTab (사진 + 채팅)
├── P상점 — PointsTab
└── 나 — MeTab (페어링 · E2E 진단)

잠금 ON → LockScreen → CleaningFlow → unlock
```

버전: **0.5.0+5**
