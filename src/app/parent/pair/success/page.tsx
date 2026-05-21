'use client';



import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Smartphone, Clock, ChevronRight } from 'lucide-react';

import { fetchPairCodeStatus, updateFamilyProfile } from '@/lib/chungsora/clientApi';

import { useAuthStore } from '@/lib/chungsora/authStore';

import { deferEffect } from '@/lib/react/deferEffect';



function getDeviceLabel(): string {

  if (typeof navigator === 'undefined') return '자녀 기기';

  const ua = navigator.userAgent;

  if (/iPhone/.test(ua)) return 'iPhone';

  if (/iPad/.test(ua)) return 'iPad';

  const galaxyMatch = ua.match(/Samsung\s+([\w\s]+)\s+Build/i);

  if (galaxyMatch) return galaxyMatch[1].trim();

  if (/Android/.test(ua)) {

    const m = ua.match(/;\s*([\w\s]+)\s+Build/);

    return m ? m[1].trim() : 'Android 기기';

  }

  return '자녀 기기';

}



function getTimeLabel(): string {

  return new Date().toLocaleTimeString('ko-KR', {

    hour: 'numeric',

    minute: '2-digit',

    hour12: true,

  });

}



export default function ParentPairSuccessPage() {

  const router = useRouter();

  const [childName, setChildName] = useState('자녀');

  const [childAge, setChildAge] = useState('');

  const [deviceLabel, setDeviceLabel] = useState('자녀 기기');

  const [connectedAt, setConnectedAt] = useState('');

  const [childDisplayName, setChildDisplayName] = useState('자녀');

  const [saving, setSaving] = useState(true);

  const [saveError, setSaveError] = useState('');



  const persistOnboard = useCallback(async (displayName: string) => {

    setSaving(true);

    setSaveError('');

    try {

      await updateFamilyProfile({

        onboard_done: true,

        child_display_name: displayName,

      });

      useAuthStore.getState().setOnboardDone(true);

      sessionStorage.removeItem('pair_child_nickname');

      sessionStorage.removeItem('pair_child_age');

      setSaving(false);

    } catch {

      setSaving(false);

      setSaveError('연결 정보를 저장하지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.');

    }

  }, []);



  useEffect(() => {

    deferEffect(() => {

      const name = sessionStorage.getItem('pair_child_nickname');

      const age = sessionStorage.getItem('pair_child_age');

      const displayName = name?.trim() || '자녀';

      if (name) setChildName(name);

      if (age) setChildAge(age);

      setChildDisplayName(displayName);

      setDeviceLabel(getDeviceLabel());

      setConnectedAt(getTimeLabel());

      const activeCode = sessionStorage.getItem('pair_active_code');

      const finish = async () => {
        if (activeCode) {
          try {
            const st = await fetchPairCodeStatus(activeCode);
            if (!st.code_used && !st.child_paired) {
              setSaving(false);
              setSaveError(
                '자녀 앱에서 코드 연결이 확인되지 않았어요. 코드 화면으로 돌아가 연결을 완료해 주세요.',
              );
              return;
            }
          } catch {
            setSaving(false);
            setSaveError('연결 상태를 확인하지 못했어요. 다시 시도해 주세요.');
            return;
          }
        }
        await persistOnboard(displayName);
        sessionStorage.removeItem('pair_active_code');
      };
      void finish();

    });

  }, [persistOnboard]);



  const canProceed = !saving && !saveError;



  return (

    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center bg-[#f7f9fa] px-5 py-12">



      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e6f9fc]">

        <span className="text-4xl">🎉</span>

      </div>



      <div className="mt-6 text-center">

        <span className="inline-block rounded-full bg-[#d1fae5] px-4 py-1 text-[12px] font-semibold text-[#065f46]">

          ✓ 연결 완료

        </span>

        <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.5px] text-[#1a1e22]">

          {childName}{childAge ? ` (만 ${childAge}세)` : ''}와<br />연결됐어요!

        </h1>

        <p className="mt-2 text-[14px] text-[#828c94]">이제 청소 습관을 함께 만들어 볼게요.</p>

      </div>



      {saving ? (

        <p className="mt-4 text-[13px] text-[#828c94]">연결 정보 저장 중…</p>

      ) : null}



      {saveError ? (

        <div className="mt-4 w-full space-y-3">

          <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-[13px] font-medium text-[#e03131]">

            {saveError}

          </p>

          <button

            type="button"

            onClick={() => void persistOnboard(childDisplayName)}

            className="ch-btn-secondary w-full py-3 text-[14px] font-semibold"

          >

            다시 시도

          </button>

        </div>

      ) : null}



      <div className="mt-8 w-full ch-card divide-y divide-[#f0f2f4] overflow-hidden">

        <div className="flex items-center gap-3 px-5 py-4">

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#e6f9fc]">

            <Smartphone size={18} className="text-[#00b8cf]" />

          </div>

          <div>

            <p className="text-[11px] font-semibold text-[#adb5bd]">연결된 기기</p>

            <p className="text-[14px] font-semibold text-[#1a1e22]">{deviceLabel}</p>

          </div>

        </div>

        <div className="flex items-center gap-3 px-5 py-4">

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#f0f2f4]">

            <Clock size={18} className="text-[#828c94]" />

          </div>

          <div>

            <p className="text-[11px] font-semibold text-[#adb5bd]">방금 연결됨</p>

            <p className="text-[14px] font-semibold text-[#1a1e22]">{connectedAt}</p>

          </div>

        </div>

      </div>



      <div className="mt-4 w-full rounded-xl bg-[#e6f9fc] px-4 py-3.5">

        <p className="text-[13px] font-medium leading-relaxed text-[#007b8a]">

          다음 단계에서 깨끗한 방을 촬영하면 AI가 청소 기준점을 잡아요. 나중에 해도 괜찮아요!

        </p>

      </div>



      <div className="mt-8 w-full space-y-3">

        <button

          type="button"

          disabled={!canProceed}

          onClick={() => router.push('/parent/onboard/baseline')}

          className="ch-btn-primary flex w-full items-center justify-center gap-2 py-4 text-[16px] font-bold disabled:opacity-40"

        >

          방 사진 올리기

          <ChevronRight size={18} />

        </button>

        <button

          type="button"

          disabled={!canProceed}

          onClick={() => router.push('/parent/home')}

          className="w-full py-3 text-[14px] font-semibold text-[#828c94] disabled:opacity-40"

        >

          나중에 하기

        </button>

      </div>



    </div>

  );

}

