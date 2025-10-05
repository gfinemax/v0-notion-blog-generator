import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

// Inter 폰트 설정
const inter = Inter({ subsets: ["latin"] })

// 사이트 전체 메타데이터 설정
export const metadata: Metadata = {
  title: {
    default: "Notion Blog",
    template: "%s | Notion Blog", // 개별 페이지 제목 템플릿
  },
  description: "Notion을 CMS로 사용하는 블로그입니다.",
  keywords: ["블로그", "Notion", "Next.js", "TypeScript"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Notion Blog",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.className}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        {/* 헤더 컴포넌트 */}
        <Header />

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">{children}</main>

        {/* 푸터 컴포넌트 */}
        <Footer />
      </body>
    </html>
  )
}
