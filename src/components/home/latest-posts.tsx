import Link from 'next/link'
import { getPublishedPosts } from '@/lib/content'
import { SectionLabel } from './section-label'

const POST_COUNT = 4

export function LatestPosts() {
  const posts = getPublishedPosts().slice(0, POST_COUNT)
  return (
    <section aria-labelledby="home-blog">
      <SectionLabel id="home-blog" index="05" name="log" command={`tail -n ${POST_COUNT} ~/blog`} />
      <ol className="panel px-4 py-3 text-[13px] sm:px-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex items-baseline gap-4 py-1.5 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <time dateTime={post.date.slice(0, 10)} className="shrink-0 tabular-nums text-neutral-400">
                {post.date.slice(0, 10)}
              </time>
              <span className="min-w-0 text-neutral-200 transition-colors group-hover:text-accent sm:truncate">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex justify-end">
        <Link href="/blog" className="text-[13px] text-neutral-400 transition-colors hover:text-accent">
          All posts &rarr;
        </Link>
      </div>
    </section>
  )
}
