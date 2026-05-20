import 'package:chungsora_child/services/lock_scheduler.dart';
import 'package:chungsora_child/models/lock_policy.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const scheduler = LockScheduler();

  LockPolicy policy({
    String time = '17:00',
    String days = '월·수·금',
    bool allowPhone = true,
  }) =>
      LockPolicy(
        lockTime: time,
        lockDays: days,
        passScore: 70,
        allowPhone: allowPhone,
        allowlist: const ['dialer', 'com.chungsora.child'],
      );

  test('unlockedToday면 잠금 안 함', () {
    expect(scheduler.shouldLockNow(policy(), unlockedToday: true), isFalse);
  });

  test('lock_time 파싱 — 형식 오류', () {
    expect(
      scheduler.shouldLockNow(
        policy(time: 'invalid'),
        unlockedToday: false,
      ),
      isFalse,
    );
  });

  test('resolveAllowlist — 전화 허용', () {
    final list = policy(allowPhone: true).resolveAllowlist();
    expect(list, contains('dialer'));
    expect(list, contains('com.chungsora.child'));
  });
}
