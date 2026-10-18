import { getGithubSnapshot } from '@/components/home/contributions/snapshot'
import { siteConfig } from '@/config/site'
import { getFeaturedProjects, getPapers, getProjects, getPublishedPosts } from '@/lib/content'
import { buildProfile } from '@/lib/profile/build'

// Machine-readable profile for the GitHub README generator. Generated once at
// build time from published content; not listed in the sitemap on purpose.
// No request, headers() or cookies() here: any of them would make it dynamic.
export const dynamic = 'force-static'

const PUBLIC_CACHE = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'

export function GET(): Response {
  const snapshot = getGithubSnapshot()
  // Fail closed: a partial profile would violate the contract, so a malformed
  // committed snapshot fails the build instead (snapshot.test.ts guards it too).
  if (!snapshot) {
    throw new Error('profile.json: src/data/github-snapshot.json failed validation')
  }
  const profile = buildProfile({
    now: new Date(),
    site: siteConfig,
    projects: getProjects(),
    featured: getFeaturedProjects(),
    papers: getPapers(),
    posts: getPublishedPosts(),
    snapshot,
  })
  return Response.json(profile, { headers: { 'Cache-Control': PUBLIC_CACHE } })
}
