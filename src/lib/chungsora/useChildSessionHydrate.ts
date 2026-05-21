'use client';

import { useEffect } from 'react';
import { fetchFamilySummary, fetchLockPolicy } from '@/lib/chungsora/clientApi';
import { tryRefreshChildSession } from '@/lib/chungsora/childSessionRefresh';
import { useAuthStore } from '@/lib/chungsora/authStore';
import { useSettingsStore } from '@/lib/chungsora/settingsStore';

/** child_session 쿠키 → zustand 동기화 + lock 정책 로드 */
export function useChildSessionHydrate() {
  const childPaired = useAuthStore((s) => s.childPaired);
  const setChildPaired = useAuthStore((s) => s.setChildPaired);
  const setLockTime = useSettingsStore((s) => s.setLockTime);
  const setLockDays = useSettingsStore((s) => s.setLockDays);
  const setPassScore = useSettingsStore((s) => s.setPassScore);
  const setAllowPhone = useSettingsStore((s) => s.setAllowPhone);
  const setBaseCleanWon = useSettingsStore((s) => s.setBaseCleanWon);
  const setCoachIds = useSettingsStore((s) => s.setCoachIds);

  useEffect(() => {
    const deviceId = useAuthStore.getState().childDeviceId;
    if (deviceId) void tryRefreshChildSession();

    void fetchLockPolicy()
      .then((p) => {
        setLockTime(p.lock_time);
        setLockDays(p.lock_days);
        setPassScore(p.pass_score);
        setAllowPhone(p.allow_phone);
      })
      .catch(() => undefined);

    if (childPaired) return;
    void fetchFamilySummary()
      .then((s) => {
        setChildPaired(true);
        setBaseCleanWon(s.base_clean_won);
        setPassScore(s.pass_score);
        setCoachIds(s.coach_character_id, s.child_coach_character_id ?? null);
      })
      .catch(() => undefined);
  }, [
    childPaired,
    setChildPaired,
    setLockTime,
    setLockDays,
    setPassScore,
    setAllowPhone,
    setBaseCleanWon,
    setCoachIds,
  ]);
}
