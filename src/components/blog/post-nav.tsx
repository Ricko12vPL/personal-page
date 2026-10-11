import Link from 'next/link'
import type { Post } from '#site/content'
import { isoDay, splitSupersededTitle, type PostNeighbours } from './post-meta'

// `.panel` draws its border outside Tailwind's layers, so state colours need `!`.
const CARD = [
  'panel group block p-4 transition-colors',
  'hover:border-neutral-700! focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent/60',
].join(' ')

interface NeighbourLinkProps {
  post: Post
  direction: 'older' | 'newer'
}

function NeighbourLink({ post, direction }: NeighbourLinkProps) {
  const { title } = splitSupersededTitle(post.title)
  const isNewer = direction === 'newer'

  return (
    <Link
      href={`/blog/${post.slug}`}
      rel={isNewer ? 'next' : 'prev'}
      className={`${CARD} ${isNewer ? 'sm:col-start-2 sm:text-right' : ''}`}
    >
      <span className="label group-hover:text-accent-dim!">
        {isNewer ? 'newer →' : '← older'}
      </span>
      <span className="mt-2 block text-[14px] leading-snug text-neutral-200 break-words group-hover:text-accent group-focus-visible:text-accent transition-colors">
        {title}
      </span>
      <time dateTime={isoDay(post.date)} className="mt-1 block text-[12px] tabular-nums text-neutral-500">
        {isoDay(post.date)}
      </time>
    </Link>
  )
}

interface PostNavProps {
  neighbours: PostNeighbours
}

// Older / newer post links under an article.
export function PostNav({ neighbours }: PostNavProps) {
  const { older, newer } = neighbours

  return (
    <nav aria-label="More posts" className="print-hidden mt-20 border-t hairline pt-8">
      {(older || newer) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {older && <NeighbourLink post={older} direction="older" />}
          {newer && <NeighbourLink post={newer} direction="newer" />}
        </div>
      )}
      <Link
        href="/blog"
        className="mt-6 inline-block text-[12px] text-neutral-500 hover:text-accent focus-visible:text-accent focus-visible:outline-none transition-colors"
      >
        <span className="prompt-caret">›</span> cd ~/blog
      </Link>
    </nav>
  )
}
