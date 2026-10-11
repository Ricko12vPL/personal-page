import type { Post } from '#site/content'
import { RecordDay, RecordPanel, RecordRow } from '@/components/ui/record-panel'
import { isoDay } from './post-meta'
import { readingMinutes } from './reading-time'

interface PostRecordProps {
  post: Post
}

/** Frontmatter record for a post: dates, reading time, tags. */
export function PostRecord({ post }: PostRecordProps) {
  return (
    <RecordPanel label="Post record" source={`${post.slug}.mdx`}>
      <RecordRow label="published">
        <RecordDay day={isoDay(post.date)} />
      </RecordRow>
      {post.updated && (
        <RecordRow label="updated">
          <RecordDay day={isoDay(post.updated)} />
        </RecordRow>
      )}
      <RecordRow label="read">
        <span className="num">{readingMinutes(post.body)}</span> min
      </RecordRow>
      {post.tags.length > 0 && (
        <RecordRow label="tags">
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-neutral-400">
            {post.tags.map((tag) => (
              <span key={tag} className="whitespace-nowrap">
                {tag.toLowerCase()}
              </span>
            ))}
          </span>
        </RecordRow>
      )}
    </RecordPanel>
  )
}
