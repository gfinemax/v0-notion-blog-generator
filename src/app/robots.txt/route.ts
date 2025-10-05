import { NextResponse } from "next/server"

/**
 * robots.txt 동적 생성
 * 검색 엔진 크롤러에게 사이트 크롤링 규칙을 알려줍니다.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
