import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/content'
import { BlogStats } from '@/components/blog/blog-stats'
import { PostLog } from '@/components/blog/post-log'
import { PromptLine } from '@/components/ui/prompt-line'
import { SectionHeading } from '@/components/ui/section-heading'
import { pageMetadata } from '@/lib/metadata'
import '@/styles/writing.css'

export const metadata: Metadata = pageMetadata({
  title: 'Blog',
  description:
    'Project updates, technical deep-dives, and engineering insights by Kacper Saks.',
  path: '/blog',
})

export default function BlogPage() {
  const posts = getPublishedPosts()

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 pt-16 pb-24 sm:pt-20">
      <SectionHeading
        as="h1"
        title="blog"
        subtitle="Project updates and engineering notes"
        meta={posts.length > 0 ? <BlogStats posts={posts} /> : undefined}
      />
      {posts.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          No posts yet.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <PromptLine path="~/blog" command="ls -t *.mdx" />
          </div>
          <PostLog posts={posts} />
        </>
      )}
    </div>
  )
}
