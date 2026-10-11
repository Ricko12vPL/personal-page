import { siteConfig } from '@/config/site'
import { pageMetadata } from '@/lib/metadata'
import { HeroIntro } from '@/components/home/hero'
import { TerminalSession } from '@/components/home/terminal-session'
import { SectionLabel } from '@/components/home/section-label'
import { AboutPanel } from '@/components/home/about-panel'
import { FeaturedProjects } from '@/components/home/featured-projects'
import { LatestPosts } from '@/components/home/latest-posts'
import { ContributionsFigure } from '@/components/home/contributions/contributions-figure'
import { getGithubSnapshot } from '@/components/home/contributions/snapshot'

export const metadata = pageMetadata({
  description: siteConfig.description,
  path: '/',
})

export default function HomePage() {
  const snapshot = getGithubSnapshot()

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-24 pt-12 sm:px-8 sm:pt-20">
      <section
        aria-label="Introduction"
        className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12"
      >
        <HeroIntro />
        <TerminalSession snapshot={snapshot} />
      </section>

      <section aria-labelledby="home-activity" className="mt-20 sm:mt-28">
        <SectionLabel
          id="home-activity"
          index="02"
          name="activity"
          command={`plot --calendar ${snapshot?.login ?? 'github'}`}
        />
        <ContributionsFigure snapshot={snapshot} />
      </section>

      <div className="mt-20 sm:mt-28">
        <AboutPanel />
      </div>

      <div className="mt-20 sm:mt-28">
        <FeaturedProjects />
      </div>

      <div className="mt-20 sm:mt-28">
        <LatestPosts />
      </div>
    </div>
  )
}
