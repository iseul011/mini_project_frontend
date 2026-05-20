# Phase 5 — 실기 E2E 검증 체크리스트

자녀 테스트 폰 1대 + USB(adb) + 부모 PWA로 아래 순서대로 확인합니다.  
앱 **E2E 진단** 화면(홈 → 🩺 아이콘)에서 실시간 상태를 볼 수 있습니다.

## 사전 준비

- [ ] APK 설치 (`/download` 또는 CI 빌드)
- [ ] Device Owner 등록 ([DEVICE_OWNER_SETUP.md](./DEVICE_OWNER_SETUP.md))
- [ ] 부모·자녀 페어링 완료
- [ ] 부모 baseline 3곳 · AI 평가 완료
- [ ] **배터리 최적화 제외** (앱 → E2E 진단 → 버튼)

---

## P5-1 Device Owner · 페어링

| # | 절차 | Pass |
|---|------|------|
| 1 | `adb shell dpm set-device-owner com.chungsora.child/.ChungsoraDeviceAdminReceiver` 성공 | ☐ |
| 2 | 앱 홈 → Device Owner **등록됨 ✓** | ☐ |
| 3 | 부모 `/parent/pair/code` 코드 → 자녀 앱 페어링 | ☐ |
| 4 | E2E 진단 → 페어링 ✓ · 감시 서비스 ✓ | ☐ |

---

## P5-2 17:00 자동 잠금 E2E

| # | 절차 | Pass |
|---|------|------|
| 1 | 부모 `/parent/more/lock` → lock_time **현재+2분**, 오늘 요일 포함 | ☐ |
| 2 | 자녀 앱 백그라운드(홈 버튼) · 화면 off | ☐ |
| 3 | 2분 후 자동 Lock Task · 잠금 UI | ☐ |
| 4 | 유튜브/Chrome 실행 **차단** 확인 | ☐ |
| 5 | E2E 진단 → native shouldLock: YES · Lock Task 활성 | ☐ |

**빠른 테스트:** lock_time=`00:00`, 오늘 요일 → 즉시 잠금 또는 「테스트 잠금」

---

## P5-3 화이트리스트 (전화 ON/OFF)

### allow_phone ON (기본)

| # | 절차 | Pass |
|---|------|------|
| 1 | 부모 lock 설정 → 전화 앱 허용 ON | ☐ |
| 2 | 잠금 중 **전화 앱** 실행 가능 | ☐ |
| 3 | E2E 진단 → resolvedPackages에 dialer 포함 | ☐ |

### allow_phone OFF

| # | 절차 | Pass |
|---|------|------|
| 1 | 부모 lock → 전화 OFF | ☐ |
| 2 | 60초 내 정책 반영 후 재잠금 | ☐ |
| 3 | 잠금 중 전화 앱 **차단** (청소해라만) | ☐ |

---

## P5-4 재부팅 · 정책 유지

| # | 절차 | Pass |
|---|------|------|
| 1 | 잠금 ON 상태에서 기기 **재부팅** | ☐ |
| 2 | 부팅 후 청소해라 **자동 실행** | ☐ |
| 3 | Lock Task **복구** (홈/다른 앱 차단) | ☐ |
| 4 | lock_time 지나지 않았으면 스케줄대로 동작 | ☐ |

---

## P5-5 배터리 · 백그라운드

| # | 절차 | Pass |
|---|------|------|
| 1 | E2E 진단 → **배터리 예외** ✓ | ☐ |
| 2 | 알림栏 「잠금 스케줄 감시 중」 표시 | ☐ |
| 3 | 앱 강제 종료 후에도 알람/서비스로 17:00 트리거 | ☐ |
| 4 | (삼성/小米) 자동 시작·배터리 **제한 없음** 수동 설정 | ☐ |

---

## 청소 → 해제 E2E (Phase 3 연동)

| # | 절차 | Pass |
|---|------|------|
| 1 | 잠금 중 「청소 시작」 | ☐ |
| 2 | dirty/after 3슬롯 · AI ≥ pass_score | ☐ |
| 3 | 🔓 잠금 해제 · Lock Task 해제 | ☐ |
| 4 | P 적립 · 당일 재잠금 없음 (unlockedToday) | ☐ |

---

## adb 유용 명령

```bash
adb shell dpm get-device-owner
adb shell dumpsys activity activities | grep mResumedActivity
adb logcat -s ChungsoraLock ChungsoraMonitor ChungsoraBoot ChungsoraAlarm
```

## 실패 시

1. E2E 진단 스크린샷
2. `logcat` 마지막 100줄
3. 부모 lock/policy JSON (pass_score, lock_time, allowlist)
