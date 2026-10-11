import Link from 'next/link'
import type { Post } from '#site/content'
import { isoDay, splitSupersededTitle } from './post-meta'
import { readingMinutes } from './reading-time'

const MAX_TAGS = 3

// Layout (grid areas per breakpoint) lives in src/styles/writing.css (.post-row).
const ROW = [
  'post-row group relative -mx-3 px-3 py-3 border-b hairline transition-colors',
  'hover:bg-neutral-900 focus-visible:bg-neutral-900',
  'focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent/60',
].join(' ')

const SUPERSEDED_ROW = 'opacity-60 hover:opacity-100 focus-visible:opacity-100'

interface PostRowProps {
  post: Post
}

export function PostRow({ post }: PostRowProps) {
  const { title, superseded } = splitSupersededTitle(post.title)
  const minutes = readingMinutes(post.body)
  const tags = post.tags.slice(0, MAX_TAGS)
  const day = isoDay(post.date)

  return (
    <li>
      <Link href={`/blog/${post.slug}`} className={superseded ? `${ROW} ${SUPERSEDED_ROW}` : ROW}>
        <span
          aria-hidden="true"
          className="absolute left-0 top-3 text-[13px] leading-6 text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          ›
        </span>
        <time
          dateTime={day}
          className="post-row__date text-[12px] leading-6 tabular-nums text-neutral-500 group-hover:text-accent-dim"
        >
          {day}
        </time>
        <span className="post-row__title text-[14px] leading-6 text-neutral-200 group-hover:text-accent group-focus-visible:text-accent transition-colors">
          {title}
          {superseded && ' '}
          {superseded && (
            <span className="label inline-block border hairline px-1.5 align-middle">
              superseded
            </span>
          )}
        </span>
        <span className="post-row__min text-[12px] leading-6 tabular-nums text-neutral-500">
          {minutes} min
        </span>
        {tags.length > 0 && (
          <span className="post-row__tags text-[12px] leading-6 text-neutral-400" title={post.tags.join(', ')}>
            {tags.join(' · ')}
          </span>
        )}
      </Link>
    </li>
  )
}
