import type { Metadata } from 'next'
import Link from 'next/link'
import { NotFoundPath } from '@/components/layout/not-found-path'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Not found',
  description: 'This page does not exist.',
  robots: { index: false, follow: true },
  openGraph: { title: 'Not found | Kacper Saks', description: 'This page does not exist.' },
}

function Prompt() {
  return (
    <div>
      <span className="prompt-user">kacper@warsaw</span> <span className="prompt-path">~</span>
    </div>
  )
}

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-24 sm:px-8 sm:py-32">
      <div className="label mb-4">error 404 · not found</div>
      <h1 className="mb-10 font-pixel text-5xl text-accent sm:text-7xl">404</h1>

      <div className="panel panel-ticks max-w-[680px] space-y-5 p-5 text-[13px] leading-relaxed sm:p-7">
        <section aria-label="Error">
          <Prompt />
          <div className="break-all">
            <span className="prompt-caret">›</span> :e <NotFoundPath />
          </div>
          <div className="break-all text-neutral-100">
            E447: Can&apos;t find file &quot;
            <NotFoundPath />
            &quot; in path
          </div>
        </section>

        <section aria-label="Pages that do exist">
          <Prompt />
          <div>
            <span className="prompt-caret">›</span> ls ~/
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="chrome-focus text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div>
          <Prompt />
          <span className="prompt-caret">›</span> <span aria-hidden="true" className="cursor-block" />
        </div>
      </div>

      <div className="label mt-6">
        press <kbd className="kbd normal-case">g</kbd> <kbd className="kbd normal-case">h</kbd> for home · <kbd className="kbd normal-case">:</kbd> for
        the command line
      </div>
    </div>
  )
}
