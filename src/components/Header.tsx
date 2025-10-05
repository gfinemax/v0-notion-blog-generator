import Link from "next/link"

/**
 * 블로그 헤더 컴포넌트
 * 모든 페이지 상단에 표시되는 네비게이션 바입니다.
 */
export default function Header() {
  return (
    <header className="bg-muted border-b border-border">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <nav className="flex items-center justify-between">
          {/* 로고 / 사이트 제목 */}
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
            Notion Blog
          </Link>

          {/* 네비게이션 메뉴 */}
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                홈
              </Link>
            </li>
            <li>
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                블로그
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
