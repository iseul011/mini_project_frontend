import Link from "next/link";
import { ChevronRight } from "lucide-react";

const ITEMS = [
  { label: "Cleaning Node", href: "/cleaning", emoji: "🧹", desc: "게임형 청소·정리", iconBg: "bg-emerald-50", hoverBorder: "hover:border-emerald-200" },
  { label: "스페이스핏", href: "/spacefit", emoji: "🛋️", desc: "가구 배치실", iconBg: "bg-teal-50", hoverBorder: "hover:border-teal-200" },
  { label: "룸퀘스트", href: "/roomquest", emoji: "🏠", desc: "홈 대시보드", iconBg: "bg-blue-50", hoverBorder: "hover:border-blue-200" },
  { label: "청소해라 (부모)", href: "/parent/home", emoji: "🏠", desc: "부모 PWA · /api/v1/parent", iconBg: "bg-cyan-50", hoverBorder: "hover:border-cyan-200" },
  { label: "청소해라 (자녀)", href: "/child/home", emoji: "👧", desc: "자녀 UI · /api/v1/child", iconBg: "bg-pink-50", hoverBorder: "hover:border-pink-200" },
] as const;

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
        <header className="border-b border-[#eaedef] bg-white px-5 pb-8 pt-12">
          <h1 className="text-[26px] font-bold text-[#2f3438]">청소 서비스</h1>
          <p className="mt-2 text-[15px] text-[#828c94]">미니 프로젝트 허브</p>
        </header>
        <ul className="flex flex-col gap-2.5 px-4 py-5">
          {ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`flex items-center gap-3.5 rounded-2xl border border-[#eaedef] bg-white p-4 ${item.hoverBorder}`}>
                <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl text-2xl ${item.iconBg}`}>{item.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#2f3438]">{item.label}</p>
                  <p className="mt-1 text-sm text-[#828c94]">{item.desc}</p>
                </div>
                <ChevronRight size={20} className="text-[#c2c8cc]" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
