/**
 * 블로그 푸터 컴포넌트
 * 모든 페이지 하단에 표시되는 푸터입니다.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 저작권 정보 */}
          <p className="text-secondary text-sm">© {currentYear} Notion Blog. All rights reserved.</p>

          {/* 소셜 링크 또는 추가 정보 */}
          <div className="flex items-center gap-4 text-sm text-secondary">
            <span>Powered by Next.js & Notion</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
