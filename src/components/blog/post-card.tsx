import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group p-6 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors bg-neutral-900/30"
    >
      <span className="text-neutral-600 text-[12px]">
        {formatDate(post.date)}
      </span>
      <h3 className="font-pixel text-neutral-100 text-base mt-3 mb-2 group-hover:text-accent transition-colors">
        {post.title.toUpperCase()}
      </h3>
      <p className="text-neutral-500 text-[13px] leading-relaxed">
        {post.description}
      </p>
    </Link>
  )
}
