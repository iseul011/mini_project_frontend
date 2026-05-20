# Device Owner 설정 가이드 (Android DPC)

청소해라 자녀 앱의 **OS 레벨 잠금**은 **Device Owner** 권한이 필요합니다.  
일반 「기기 관리자」만으로는 Lock Task(키오스크)가 제한됩니다.

## 사전 조건

- **Android 7.0+** (API 24+)
- **공장 초기화된 기기** 또는 Google 계정·다른 Device Owner가 없는 상태
- USB 디버깅 가능한 테스트 폰 1대
- PC에 [Android platform-tools (adb)](https://developer.android.com/tools/releases/platform-tools) 설치

## 1. APK 설치

1. Vercel `/download`에서 APK 다운로드
2. 「알 수 없는 앱」 설치 허용 후 설치
3. 앱을 **한 번 실행** (패키지 등록)

## 2. Device Owner 등록 (ADB)

USB 연결 후:

```bash
adb devices
adb shell dpm set-device-owner com.chungsora.child/.ChungsoraDeviceAdminReceiver
```

성공 메시지:

```
Success: Device owner set to package com.chungsora.child
Active admin set to component {com.chungsora.child/com.chungsora.child.ChungsoraDeviceAdminReceiver}
```

### 자주 나는 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `Not allowed to set the device owner` | Google 계정 로그인됨 | 공장 초기화 후 **Wi‑Fi·계정 설정 전** ADB 실행 |
| `Already has an owner` | 다른 MDM/DPC 존재 | 공장 초기화 |
| `Unknown admin` | 앱 미설치 | APK 설치 후 1회 실행 |

## 3. 앱에서 확인

1. 자녀 앱 실행 → 홈 화면 **Device Owner: 등록됨 ✓**
2. 부모 PWA에서 페어링 코드 발급 → 자녀 앱 **페어링** 입력
3. **테스트 잠금 (즉시)** 버튼 → Lock Task 진입 확인
4. 홈 버튼·다른 앱 전환 차단 확인
5. **전화 앱**은 부모 설정(allow_phone)에 따라 허용

## 4. QR 프로비저닝 (선택 · Android 9+)

대량 배포 시 NFC/QR 프로비저닝을 쓸 수 있습니다. MVP는 ADB 방식을 권장합니다.

공장 초기화 후 초기 설정 화면에서 QR 스캔:

- [Android Enterprise QR code generator](https://developers.google.com/android/management/qrcode) 참고
- `com.chungsora.child` 패키지를 DPC로 지정

## 5. 잠금 동작 요약

```
부모 PWA /parent/more/lock
  → PUT /api/v1/lock/policy (allowlist, lock_time, lock_days)
  → 자녀 앱 LockService 60초 폴링
  → 스케줄 충족 시 LockPlugin.startLock(whitelist)
  → Lock Task: 전화·청소해라만 허용
  → AI 청소 합격(Phase 3) → stopLock
```

## 6. Device Owner 해제

테스트 종료 시:

```bash
adb shell dpm remove-active-admin com.chungsora.child/.ChungsoraDeviceAdminReceiver
# 또는 공장 초기화
```

## 7. 허용 앱 (allowlist) 별칭

| BE 값 | Android 처리 |
|--------|----------------|
| `dialer` | 기본 전화 앱 |
| `com.chungsora.child` | 청소해라 |
| `com.android.emergency` | 긴급 전화 |

기종별 전화·긴급 패키지명이 다를 수 있어 LockPlugin이 설치된 패키지만 화이트리스트에 추가합니다.
