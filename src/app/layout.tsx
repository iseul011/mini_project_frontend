import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/chungsora/PwaRegister";

export const metadata: Metadata = {
  title: "청소해라",
  description: "가족 청소 습관 · 부모 PWA",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00B8CF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" style={{ colorScheme: "light only" }}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased font-pretendard bg-[#f7f9fa] text-[#2f3438]">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
