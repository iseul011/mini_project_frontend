import Link from "next/link";

export default function DaughterCleanPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f9fa] px-6 text-center">
      <h1 className="text-xl font-bold">딸아 청소해라</h1>
      <p className="mt-2 text-sm text-[#828c94]">프로토타입 준비 중</p>
      <Link href="/" className="mt-6 rounded-xl bg-[#35c5f0] px-5 py-2.5 text-sm font-bold text-white">
        홈으로
      </Link>
    </div>
  );
}
