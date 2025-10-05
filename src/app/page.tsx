import { getPublishedPosts } from "@/lib/notion"
import Image from "next/image"
import Link from "next/link"

/**
 * 게시글 목록 페이지 (홈페이지)
 * Published가 체크된 게시글들을 최신순으로 표시합니다.
 */
export default async function HomePage() {
  // 발행된 게시글 목록 가져오기
  const posts = await getPublishedPosts()

  const isConfigured = process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">블로그</h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Notion을 CMS로 사용하는 블로그입니다. 다양한 주제의 글을 공유합니다.
        </p>
      </div>

      {!isConfigured ? (
        <div className="max-w-2xl mx-auto bg-muted border border-border rounded-lg p-8 space-y-4">
          <h2 className="text-2xl font-bold text-center">환경 변수 설정이 필요합니다</h2>
          <div className="space-y-3 text-secondary">
            <p>이 블로그를 사용하려면 다음 환경 변수를 설정해야 합니다:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <code className="bg-background px-2 py-1 rounded text-sm">NOTION_API_KEY</code> - Notion Integration
                Token
              </li>
              <li>
                <code className="bg-background px-2 py-1 rounded text-sm">NOTION_DATABASE_ID</code> - Notion
                데이터베이스 ID
              </li>
            </ul>
            <div className="mt-6 p-4 bg-background rounded border border-border">
              <p className="font-semibold mb-2">설정 방법:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>v0 우측 상단의 ⚙️ (톱니바퀴) 아이콘을 클릭합니다</li>
                <li>"Environment Variables" 탭을 선택합니다</li>
                <li>위의 환경 변수들을 추가합니다</li>
              </ol>
            </div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary text-lg">아직 게시된 글이 없습니다.</p>
          <p className="text-secondary text-sm mt-2">
            Notion 데이터베이스에 게시글을 추가하고 Published 체크박스를 켜주세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-muted rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* 썸네일 이미지 */}
              {post.thumbnail ? (
                <div className="relative w-full h-48 bg-border">
                  <Image
                    src={post.thumbnail || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-border flex items-center justify-center">
                  <span className="text-secondary">이미지 없음</span>
                </div>
              )}

              {/* 게시글 정보 */}
              <div className="p-5 space-y-3">
                {/* 카테고리 및 날짜 */}
                <div className="flex items-center justify-between text-sm text-secondary">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">{post.category}</span>
                  <time dateTime={post.publishedDate}>
                    {new Date(post.publishedDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>

                {/* 제목 */}
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {/* 요약 */}
                <p className="text-secondary line-clamp-3">{post.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// 페이지를 정적으로 생성하고 주기적으로 재검증 (ISR)
export const revalidate = 60 // 60초마다 재검증
