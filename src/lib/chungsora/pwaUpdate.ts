'use client';

const SW_URL = '/sw.js';

let pendingReload = false;

function requestSkipWaiting(registration: ServiceWorkerRegistration): void {
  const worker = registration.waiting;
  if (!worker) return;
  pendingReload = true;
  worker.postMessage({ type: 'SKIP_WAITING' });
}

/** 대기 중인 새 SW가 있으면 즉시 활성화 (업데이트 시에만 새로고침) */
export function activateWaitingServiceWorker(registration: ServiceWorkerRegistration): void {
  const waiting = registration.waiting;
  if (!waiting) return;
  if (!navigator.serviceWorker.controller) {
    waiting.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  requestSkipWaiting(registration);
}

export async function registerPwaAutoUpdate(): Promise<(() => void) | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;

  const onControllerChange = () => {
    if (!pendingReload) return;
    pendingReload = false;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

  const registration = await navigator.serviceWorker.register(SW_URL, {
    scope: '/',
    updateViaCache: 'none',
  });

  activateWaitingServiceWorker(registration);

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed') {
        activateWaitingServiceWorker(registration);
      }
    });
  });

  const checkForUpdate = () => {
    void registration.update().catch(() => undefined);
  };

  checkForUpdate();

  const intervalId = window.setInterval(checkForUpdate, 60 * 60 * 1000);
  const onVisible = () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  };
  const onFocus = () => checkForUpdate();

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onFocus);

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onFocus);
    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  };
}
