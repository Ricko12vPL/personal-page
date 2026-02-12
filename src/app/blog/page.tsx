import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/content'
import { PostCard } from '@/components/blog/post-card'
import { SectionHeading } from '@/components/ui/section-heading'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Project updates, technical deep-dives, and engineering insights by Kacper Saks.',
}

export default function BlogPage() {
  const posts = getPublishedPosts()

  return (
    <div className="max-w-[800px] mx-auto px-8 py-20">
      <SectionHeading
        title="blog"
        subtitle="Project updates and engineering notes"
      />
      {posts.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          No posts yet.
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
