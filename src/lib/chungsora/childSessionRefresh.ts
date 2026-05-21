'use client';

import { refreshChildDeviceToken } from '@/lib/chungsora/clientApi';
import { useAuthStore } from '@/lib/chungsora/authStore';

/** JWT 만료 시 DB 연결은 유지한 채 토큰만 갱신 */
export async function tryRefreshChildSession(): Promise<boolean> {
  const deviceId = useAuthStore.getState().childDeviceId;
  if (!deviceId) return false;
  try {
    const res = await refreshChildDeviceToken(deviceId);
    if (!res.ok || !res.device_token) return false;
    useAuthStore.getState().setChildSession({
      token: res.device_token,
      deviceId: res.device_id ?? deviceId,
    });
    return true;
  } catch {
    return false;
  }
}
