# Phase 6 — Production Release 가이드

## MVP 기능 범위 (v0.5.0)

- Android DPC 잠금 · AI 청소 · unlock
- PWA parity: 홈 · 로그 · P상점 · 나
- Vercel `/download` APK 배포
- E2E 진단 · 체크리스트

## 배포 파이프라인

```
mini_flutter push → GitHub Actions build-apk
  → mini_frontend/public/apk/app-release.apk
  → Vercel auto-deploy → /download
```

## 서명 APK (Play Store / 장기 배포)

현재 CI는 **debug signing** APK입니다. 스토어 배포 시:

1. keystore 생성 (1회)
   ```bash
   keytool -genkey -v -keystore chungsora-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chungsora
   ```
2. GitHub Secrets 등록
   - `ANDROID_KEYSTORE_BASE64` — jks base64
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
3. `build-apk.yml`에 `flutter build apk --release` + signing config 추가

> keystore는 **절대** repo에 커밋하지 마세요.

## 환경 변수

| 빌드 | 변수 |
|------|------|
| Flutter | `--dart-define=API_BASE_URL=http://43.201.95.108:8080` |
| Vercel | `API_URL` (PWA BFF) |

## 릴리스 체크리스트

- [ ] `docs/E2E_CHECKLIST.md` 실기 Pass
- [ ] `/download` APK · QR 동작
- [ ] Device Owner 가이드 확인
- [ ] EC2 `/health/ready` uploads ok
- [ ] CORS에 Vercel 도메인 포함

## 버전 정책

- `pubspec.yaml` `version: MAJOR.MINOR.PATCH+BUILD`
- CI가 `version.json` 자동 갱신

## 알려진 제한 (v0.5)

- iOS 미지원 (C-50 추후)
- 영상·고스트 오버레이 미구현 (사진 MVP)
- 제안(propose) 탭 미구현
- Play Store 미등록 — sideload APK only
