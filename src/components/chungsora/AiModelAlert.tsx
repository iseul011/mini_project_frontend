'use client';

import { AI_MODEL_ALERT_DEFAULT } from '@/lib/chungsora/modelAlert';

type AiModelAlertProps = {
  open: boolean;
  message?: string;
  onClose: () => void;
};

export function AiModelAlert({ open, message, onClose }: AiModelAlertProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-model-alert-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <p id="ai-model-alert-title" className="text-base font-bold text-[#2f3438]">
          AI 모델 연결 오류
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#828c94]">
          {message?.trim() || AI_MODEL_ALERT_DEFAULT}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="ch-btn-primary mt-6 w-full py-3.5 text-sm font-semibold"
        >
          확인
        </button>
      </div>
    </div>
  );
}
