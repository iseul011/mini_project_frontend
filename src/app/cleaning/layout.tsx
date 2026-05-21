import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { CleaningChildRedirect } from './CleaningChildRedirect'

export const metadata: Metadata = {
  title: '청소 던전 — 나혼렙 시스템',
  description: '집을 던전으로, 청소를 마수 토벌로',
}

export default function CleaningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08080f] flex justify-center">
      <div className="w-full max-w-sm min-h-screen flex flex-col relative overflow-hidden">
        {/* 배경 글로우 효과 */}
        <div className="fixed inset-0 max-w-sm mx-auto pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-[radial-gradient(ellipse,rgba(56,182,255,0.04)_0%,transparent_70%)]" />
        </div>
        <CleaningChildRedirect>{children}</CleaningChildRedirect>
      </div>
    </div>
  )
}
