"use server"

import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"
import type { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints"
import { extractPostData, type BlogPost, type BlogPostDetail } from "@/lib/notion"

/**
 * Notion 클라이언트를 생성합니다.
 * 환경 변수가 없으면 null을 반환합니다.
 */
function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) {
    return null
  }
  return new Client({ auth: apiKey })
}

/**
 * Notion 데이터베이스에서 발행된(Published) 게시글 목록을 가져옵니다.
 * Published Date 기준으로 최신순 정렬됩니다.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    if (!databaseId) {
      console.warn("⚠️ NOTION_DATABASE_ID가 설정되지 않았습니다. 환경 변수를 설정해주세요.")
      return []
    }

    const notion = getNotionClient()
    if (!notion) {
      console.warn("⚠️ NOTION_API_KEY가 설정되지 않았습니다. 환경 변수를 설정해주세요.")
      return []
    }

    // Notion 데이터베이스 쿼리 실행
    const response: QueryDatabaseResponse = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Published",
        checkbox: {
          equals: true, // Published 체크박스가 체크된 항목만 가져오기
        },
      },
      sorts: [
        {
          property: "Published Date",
          direction: "descending", // 최신순 정렬
        },
      ],
    })

    // 응답 데이터를 BlogPost 타입으로 변환
    const posts: BlogPost[] = response.results.map((page) => {
      return extractPostData(page as PageObjectResponse)
    })

    return posts
  } catch (error) {
    console.error("게시글 목록을 가져오는 중 오류 발생:", error)
    return []
  }
}

/**
 * 특정 slug를 가진 게시글의 상세 정보를 가져옵니다.
 * Notion 페이지의 콘텐츠를 Markdown으로 변환하여 반환합니다.
 */
export async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    if (!databaseId) {
      console.warn("⚠️ NOTION_DATABASE_ID가 설정되지 않았습니다. 환경 변수를 설정해주세요.")
      return null
    }

    const notion = getNotionClient()
    if (!notion) {
      console.warn("⚠️ NOTION_API_KEY가 설정되지 않았습니다. 환경 변수를 설정해주세요.")
      return null
    }

    // slug와 일치하는 게시글 검색
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
          {
            property: "Published",
            checkbox: {
              equals: true, // 발행된 게시글만 가져오기
            },
          },
        ],
      },
    })

    if (response.results.length === 0) {
      return null // 해당 slug의 게시글이 없음
    }

    const page = response.results[0] as PageObjectResponse
    const postData = extractPostData(page)

    // Notion 페이지를 Markdown으로 변환
    const n2m = new NotionToMarkdown({ notionClient: notion })
    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const mdString = n2m.toMarkdownString(mdBlocks)
    const content = mdString.parent // Markdown 문자열 추출

    return {
      ...postData,
      content,
    }
  } catch (error) {
    console.error(`게시글(slug: ${slug})을 가져오는 중 오류 발생:`, error)
    return null
  }
}

/**
 * 모든 발행된 게시글의 slug 목록을 가져옵니다.
 * 동적 라우팅을 위한 generateStaticParams에서 사용됩니다.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await getPublishedPosts()
    return posts.map((post) => post.slug)
  } catch (error) {
    console.error("slug 목록을 가져오는 중 오류 발생:", error)
    return []
  }
}
