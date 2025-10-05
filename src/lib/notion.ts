import { NotionToMarkdown } from "notion-to-md"
import { Client } from "@notionhq/client"

// 블로그 게시글 타입 정의
export interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string
  publishedDate: string
  category: string
  thumbnail: string | null
}

// 게시글 상세 정보 타입 (콘텐츠 포함)
export interface BlogPostDetail extends BlogPost {
  content: string
}

// Notion API 응답 타입
interface NotionPage {
  id: string
  properties: {
    Name: {
      type: "title"
      title: Array<{ plain_text: string }>
    }
    Slug: {
      type: "rich_text"
      rich_text: Array<{ plain_text: string }>
    }
    Summary: {
      type: "rich_text"
      rich_text: Array<{ plain_text: string }>
    }
    "Published Date": {
      type: "date"
      date: { start: string } | null
    }
    Category: {
      type: "select"
      select: { name: string } | null
    }
    Files: {
      type: "files"
      files: Array<{
        type: "external" | "file"
        external?: { url: string }
        file?: { url: string }
      }>
    }
  }
}

/**
 * Notion 페이지 객체에서 필요한 데이터를 추출하여 BlogPost 타입으로 변환합니다.
 */
export function extractPostData(page: any): BlogPost {
  const properties = page.properties

  // Name (제목) 추출
  const title =
    properties.Name?.type === "title" && properties.Name.title.length > 0
      ? properties.Name.title[0].plain_text
      : "제목 없음"

  // Slug 추출
  const slug =
    properties.Slug?.type === "rich_text" && properties.Slug.rich_text.length > 0
      ? properties.Slug.rich_text[0].plain_text
      : ""

  // Summary 추출
  const summary =
    properties.Summary?.type === "rich_text" && properties.Summary.rich_text.length > 0
      ? properties.Summary.rich_text[0].plain_text
      : ""

  // Published Date 추출
  const publishedDate =
    properties["Published Date"]?.type === "date" && properties["Published Date"].date
      ? properties["Published Date"].date.start
      : ""

  // Category 추출
  const category =
    properties.Category?.type === "select" && properties.Category.select ? properties.Category.select.name : "미분류"

  // Files (썸네일) 추출
  let thumbnail: string | null = null
  if (properties.Files?.type === "files" && properties.Files.files.length > 0) {
    const file = properties.Files.files[0]
    if (file.type === "external") {
      thumbnail = file.external.url
    } else if (file.type === "file") {
      thumbnail = file.file.url
    }
  }

  return {
    id: page.id,
    title,
    slug,
    summary,
    publishedDate,
    category,
    thumbnail,
  }
}

/**
 * 발행된 모든 블로그 게시글을 가져옵니다.
 * Notion REST API를 직접 호출하여 데이터를 가져옵니다.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!process.env.NOTION_DATABASE_ID || !process.env.NOTION_API_KEY) {
    console.log("[v0] Notion 환경 변수가 설정되지 않았습니다.")
    return []
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: "Published Date",
            direction: "descending",
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("[v0] Notion API 오류:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    const posts = data.results.map(extractPostData)

    console.log("[v0] 게시글 수:", posts.length)
    return posts
  } catch (error) {
    console.error("[v0] 게시글 목록 가져오기 오류:", error)
    return []
  }
}

/**
 * 특정 slug를 가진 게시글을 가져옵니다.
 * @param slug - 게시글의 고유 slug
 * @returns 게시글 데이터 또는 null (찾지 못한 경우)
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!process.env.NOTION_DATABASE_ID || !process.env.NOTION_API_KEY) {
    console.log("[v0] Notion 환경 변수가 설정되지 않았습니다.")
    return null
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: "Published",
              checkbox: {
                equals: true,
              },
            },
            {
              property: "Slug",
              rich_text: {
                equals: slug,
              },
            },
          ],
        },
      }),
    })

    if (!response.ok) {
      console.error("[v0] Notion API 오류:", response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (data.results.length === 0) {
      return null
    }

    return extractPostData(data.results[0])
  } catch (error) {
    console.error("[v0] 게시글 가져오기 오류:", error)
    return null
  }
}

/**
 * 게시글의 Notion 블록 콘텐츠를 마크다운으로 변환하여 가져옵니다.
 * @param pageId - Notion 페이지 ID
 * @returns 마크다운 형식의 콘텐츠 문자열
 */
export async function getPostContent(pageId: string): Promise<string> {
  if (!process.env.NOTION_API_KEY) {
    console.log("[v0] NOTION_API_KEY가 설정되지 않았습니다.")
    return ""
  }

  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    })

    const n2m = new NotionToMarkdown({ notionClient: notion })

    // Notion 블록을 마크다운으로 변환
    const mdblocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdblocks)

    return mdString.parent
  } catch (error) {
    console.error("[v0] 게시글 콘텐츠 가져오기 오류:", error)
    return ""
  }
}

/**
 * 모든 발행된 게시글의 slug 목록을 가져옵니다.
 * 정적 경로 생성(generateStaticParams)에 사용됩니다.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts()
  return posts.map((post) => post.slug).filter((slug) => slug !== "")
}
