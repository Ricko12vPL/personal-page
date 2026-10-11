import type { Post } from '#site/content'
import { DETAIL_TITLE } from '@/components/ui/detail-layout'
import { PathCrumb } from '@/components/ui/path-crumb'
import { splitSupersededTitle } from './post-meta'

interface PostHeaderProps {
  post: Post
}

/** Crumb, title (with a "superseded" tag instead of a bracket prefix) and lede. */
export function PostHeader({ post }: PostHeaderProps) {
  const { title, superseded } = splitSupersededTitle(post.title)

  return (
    <>
      <PathCrumb segments={[{ label: 'blog', href: '/blog' }]} leaf={`${post.slug}.mdx`} />
      <h1 className={DETAIL_TITLE}>
        {superseded && (
          <>
            <span className="label inline-block border hairline px-1.5 py-0.5 align-middle font-mono">
              superseded
            </span>{' '}
          </>
        )}
        {title}
      </h1>
      <p className="text-neutral-400 text-[15px] leading-relaxed">{post.description}</p>
    </>
  )
}
