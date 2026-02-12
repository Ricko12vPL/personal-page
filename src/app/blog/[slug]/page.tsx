import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedPosts, getPostBySlug } from '@/lib/content'
import { MDXContent } from '@/components/mdx/mdx-components'
import { TechTag } from '@/components/projects/tech-tag'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

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
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="max-w-[800px] mx-auto px-8 py-20">
      <Link
        href="/blog"
        className="text-neutral-500 text-[13px] hover:text-accent transition-colors mb-12 inline-block"
      >
        &larr; Back to blog
      </Link>

      <header className="mb-16">
        <span className="text-neutral-600 text-[12px]">
          {formatDate(post.date)}
          {post.updated && ` — updated ${formatDate(post.updated)}`}
        </span>
        <h1 className="font-pixel text-neutral-100 text-3xl sm:text-4xl mt-4 mb-6 tracking-tight">
          {post.title.toUpperCase()}
        </h1>
        <p className="text-neutral-400 text-[15px] mb-6">{post.description}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TechTag key={tag} tag={tag} />
          ))}
        </div>
      </header>

      <MDXContent code={post.body} />
    </div>
  )
}
