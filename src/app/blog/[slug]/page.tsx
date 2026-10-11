import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedPosts, getPostBySlug } from '@/lib/content'
import { MDXContent } from '@/components/mdx/mdx-components'
import { PostHeader } from '@/components/blog/post-header'
import { PostNav } from '@/components/blog/post-nav'
import { PostRecord } from '@/components/blog/post-record'
import { findNeighbours } from '@/components/blog/post-meta'
import { DetailLayout } from '@/components/ui/detail-layout'
import { pageMetadata } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const neighbours = findNeighbours(getPublishedPosts(), post.slug)

  return (
    <DetailLayout header={<PostHeader post={post} />} record={<PostRecord post={post} />}>
      <MDXContent code={post.body} />
      <PostNav neighbours={neighbours} />
    </DetailLayout>
  )
}
