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

## APK CI 트러블슈팅

CI가 실패해도 Gradle 초기 단계는 통과할 수 있습니다. **APK가 없으면 `assembleRelease`까지 실패한 것**입니다.

### 빌드 로그 확인 (URL)

| 용도 | URL |
|------|-----|
| 최신 요약 (Vercel) | https://mini3.cloud/build-tail.txt |
| GitHub raw (동일 파일) | https://raw.githubusercontent.com/jiminsss02/mini_project_frontend/main/public/build-tail.txt |
| Actions 상세 | https://github.com/jiminsss02/mini_project_frontend/actions |

> `wouldyouin.com/build-tail.txt` 는 사용하지 않습니다. `public/build-tail.txt` 가 Vercel에 배포됩니다.

### 실패 원인 읽는 법

`build-tail.txt`에서 아래 순으로 확인:

1. **`=== Dart analyze errors ===`** — `error •` 가 있으면 Dart 컴파일 실패 (APK 단계 전)
2. **`=== Gradle/Kotlin errors ===`** — `e: file://...LockPlugin.kt` 등 Kotlin 컴파일 실패 (가장 흔함)
3. **`FAILURE:` / `BUILD FAILED`** — Gradle 종료 (원인은 위 `e:` 줄)

### 흔한 원인 (우선순위)

| 순위 | 원인 | 증상 | 조치 |
|------|------|------|------|
| 1 | **Kotlin 앱 코드** | `LockPlugin.kt` `e:` 줄, `Unresolved reference`, `No value passed for parameter` | `mini_flutter/android/.../kotlin/` 수정 후 push |
| 2 | **Dart 타입** | analyze `error • argument_type_not_assignable` | `flutter analyze` 로컬 또는 CI 로그 |
| 3 | Gradle wrapper / res | `gradlew` 없음, mipmap 누락 | CI가 Flutter template 동기화 — 보통 해결됨 |
| — | Java 17 / Gradle 버전 | **현재 1순위 아님** — 140+ task 실행 후 Kotlin에서 멈춤 | Java 17 유지 |

### APK 수동 배포 (CI 수정 전 급할 때)

로컬에서 `flutter build apk --release` 성공 후:

```bash
cp mini_flutter/build/app/outputs/flutter-apk/app-release.apk mini_frontend/public/apk/
# version.json 의 built_at, apk_size_bytes, commit 수동 갱신
git add public/apk/
git commit -m "chore(apk): manual release [skip ci]"
git push
```

→ Vercel 재배포 후 https://mini3.cloud/download

### 성공 확인

- 커밋 메시지: `chore(apk): release X.X.X [skip ci]`
- `public/apk/version.json` → `built_at`, `apk_size_bytes` 가 null 이 아님
- `public/apk/app-release.apk` 파일 존재

## 알려진 제한 (v0.5)

- iOS 미지원 (C-50 추후)
- 영상·고스트 오버레이 미구현 (사진 MVP)
- 제안(propose) 탭 미구현
- Play Store 미등록 — sideload APK only
