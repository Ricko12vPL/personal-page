// The hero's right column: a short, real terminal session. Every value comes
// from content (Velite) or the dated GitHub snapshot.
import Link from 'next/link'
import type { ReactNode } from 'react'
import { getPapers, getProjects } from '@/lib/content'
import { StatusBadge } from '@/components/projects/status-badge'
import { formatCount } from './contributions/calendar-model'
import type { GithubSnapshot } from './contributions/snapshot'

const USER = 'kacper@warsaw'
const IDENTITY =
  'Kacper Saks — ML & backend engineer · BEng Mechanical Engineering · Airbus Defence and Space'

function shortTitle(title: string): string {
  return title.split(':')[0].trim()
}

function Prompt({ command }: { command?: string }) {
  return (
    <div>
      <span className="prompt-user">{USER}</span> <span className="prompt-path">~</span>{' '}
      <span className="prompt-caret">›</span>{' '}
      {command ? (
        <span className="text-neutral-100">{command}</span>
      ) : (
        <span aria-hidden="true" className="cursor-block" />
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline">
      <dt className="flex w-[17ch] shrink-0 items-baseline gap-2 text-neutral-400">
        <span>{label}</span>
        <span aria-hidden="true" className="dotted-leader" />
      </dt>
      <dd className="ml-2 min-w-0 truncate">{children}</dd>
    </div>
  )
}

function ProfileOutput({ snapshot }: { snapshot: GithubSnapshot | null }) {
  if (!snapshot) return <div className="text-neutral-400">gh: snapshot unavailable</div>
  const { profile, contributions, checkedAt } = snapshot
  return (
    <>
      <dl>
        <Row label="repos">
          <span className="num">{formatCount(profile.publicRepos)}</span>
          <span className="text-neutral-400"> public</span>
        </Row>
        <Row label="followers">
          <span className="num">{formatCount(profile.followers)}</span>
        </Row>
        <Row label="contributions">
          <span className="num">{formatCount(contributions.total)}</span>
          <span className="text-neutral-400"> last 12 mo</span>
        </Row>
        <Row label="member since">
          <span className="text-neutral-200 tabular-nums">{profile.memberSince}</span>
        </Row>
      </dl>
      <div className="text-[11px] text-neutral-400">checked {checkedAt} · public profile</div>
    </>
  )
}

function NowOutput() {
  const active = getProjects().filter((project) => project.status === 'in-progress')
  const paper = getPapers()[0]
  if (active.length === 0 && !paper) return <div className="text-neutral-400">(empty)</div>
  return (
    <ul>
      {active.map((project) => (
        <li key={project.slug} className="flex items-baseline gap-3">
          <StatusBadge status={project.status} className="w-[96px] shrink-0 text-[12px]" />
          <Link
            href={`/projects/${project.slug}`}
            title={project.title}
            className="min-w-0 truncate text-neutral-200 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60"
          >
            {shortTitle(project.title)}
          </Link>
        </li>
      ))}
      {paper && (
        <li className="flex items-baseline gap-3">
          <span className="w-[96px] shrink-0 text-[12px] text-neutral-400">latest paper</span>
          <Link
            href={`/research/${paper.slug}`}
            title={paper.title}
            className="min-w-0 truncate text-neutral-200 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60"
          >
            {shortTitle(paper.title)}
          </Link>
        </li>
      )}
    </ul>
  )
}

export function TerminalSession({ snapshot }: { snapshot: GithubSnapshot | null }) {
  return (
    <section aria-label="Terminal session" className="panel panel-ticks min-w-0">
      <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
        <span className="label">tty1 — {USER}</span>
        <span aria-hidden="true" className="label">zsh</span>
      </div>
      <div className="space-y-4 px-4 py-4 text-[13px] leading-[1.7]">
        <div>
          <Prompt command="whoami" />
          <div className="text-neutral-300">{IDENTITY}</div>
        </div>
        <div>
          <Prompt command={`gh api users/${snapshot?.login ?? 'Ricko12vPL'}`} />
          <ProfileOutput snapshot={snapshot} />
        </div>
        <div>
          <Prompt command="ls ~/now" />
          <NowOutput />
        </div>
        <Prompt />
      </div>
    </section>
  )
}
