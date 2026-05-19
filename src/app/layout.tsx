import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini — 청소 서비스",
  description: "게임형 청소·Spacefit·Roomquest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" style={{ colorScheme: "light only" }}>
      <body className="antialiased bg-white text-black">{children}</body>
    </html>
  );
}
