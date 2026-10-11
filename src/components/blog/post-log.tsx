import type { Post } from '#site/content'
import { groupPostsByYear, plural } from './post-meta'
import { PostRow } from './post-row'

interface PostLogProps {
  posts: readonly Post[]
}

// Newest-first posts as a log, one section per year.
export function PostLog({ posts }: PostLogProps) {
  return (
    <div className="space-y-12">
      {groupPostsByYear(posts).map(({ year, posts: yearPosts }) => (
        <section key={year} aria-labelledby={`blog-year-${year}`}>
          <div className="flex items-baseline gap-3 mb-1">
            <h2 id={`blog-year-${year}`} className="font-pixel text-neutral-100 text-xl tracking-tight">
              {year}
            </h2>
            <span aria-hidden="true" className="dotted-leader" />
            <span className="label">
              <span className="num">{yearPosts.length}</span> {plural(yearPosts.length, 'post')}
            </span>
          </div>
          <ol className="border-t hairline">
            {yearPosts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
