import { getPostBySlug, getAllPostSlugs, getPostContent } from "@/lib/notion"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

// 동적 라우팅을 위한 파라미터 타입 정의
interface PageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * 동적 메타데이터 생성 함수
 * 각 게시글의 제목과 요약을 기반으로 SEO 최적화된 메타데이터를 생성합니다.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "게시글을 찾을 수 없습니다",
    }
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedDate,
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  }
}

/**
 * 정적 경로 생성 함수
 * 빌드 시점에 모든 게시글의 경로를 미리 생성합니다.
 */
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

/**
 * 게시글 상세 페이지
 * slug를 기반으로 Notion 페이지의 콘텐츠를 렌더링합니다.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  // 게시글이 없으면 404 페이지 표시
  if (!post) {
    notFound()
  }

  const content = await getPostContent(post.id)

  return (
    <article className="max-w-4xl mx-auto">
      {/* 뒤로 가기 링크 */}
      <Link href="/" className="inline-flex items-center text-primary hover:text-accent transition-colors mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로 돌아가기
      </Link>

      {/* 썸네일 이미지 */}
      {post.thumbnail && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image src={post.thumbnail || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {/* 게시글 헤더 */}
      <header className="mb-8 space-y-4">
        {/* 카테고리 및 날짜 */}
        <div className="flex items-center gap-4 text-sm text-secondary">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded">{post.category}</span>
          <time dateTime={post.publishedDate}>
            {new Date(post.publishedDate).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        {/* 제목 */}
        <h1 className="text-4xl md:text-5xl font-bold text-balance">{post.title}</h1>

        {/* 요약 */}
        {post.summary && <p className="text-lg text-secondary text-pretty">{post.summary}</p>}
      </header>

      {/* 구분선 */}
      <hr className="border-border mb-8" />

      {/* 게시글 본문 (Markdown 렌더링) */}
      <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* 하단 구분선 */}
      <hr className="border-border mt-12 mb-8" />

      {/* 하단 네비게이션 */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
        >
          다른 글 보기
        </Link>
      </div>
    </article>
  )
}

// 페이지를 정적으로 생성하고 주기적으로 재검증 (ISR)
export const revalidate = 60 // 60초마다 재검증
