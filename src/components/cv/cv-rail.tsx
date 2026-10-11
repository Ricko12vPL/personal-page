import { RecordPanel, RecordRow } from '@/components/ui/record-panel'
import { CV_CONTACTS } from './contacts'
import { CvActions } from './cv-actions'

export interface CvSection {
  id: string
  label: string
}

interface CvRailProps {
  sections: readonly CvSection[]
}

function SectionIndex({ sections }: CvRailProps) {
  return (
    <nav aria-label="CV sections">
      <div className="label mb-2">sections</div>
      <ol className="space-y-1 text-[12px]">
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex items-baseline gap-3 text-neutral-400 transition-colors hover:text-accent"
            >
              <span className="w-5 shrink-0 text-[11px] tabular-nums text-accent/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Desktop right rail for /cv, mirroring the research RECORD panel: contact
 * record, the PDF actions and a section index. Hidden below lg (the page keeps
 * its inline actions there) and never printed.
 */
export function CvRail({ sections }: CvRailProps) {
  return (
    <aside className="print-hidden hidden min-w-0 pt-16 lg:block">
      <div className="sticky top-24 space-y-8">
        <RecordPanel label="CV record" source="kacper-saks-cv.pdf" footer={<CvActions />}>
          <RecordRow label="based">Warsaw, Poland</RecordRow>
          {CV_CONTACTS.map((contact) => (
            <RecordRow key={contact.label} label={contact.label.toLowerCase()}>
              <a
                href={contact.href}
                target={contact.external ? '_blank' : undefined}
                rel={contact.external ? 'noopener noreferrer' : undefined}
                className="text-accent [overflow-wrap:anywhere] transition-colors hover:text-accent-dim"
              >
                {contact.text}
              </a>
            </RecordRow>
          ))}
        </RecordPanel>
        <SectionIndex sections={sections} />
      </div>
    </aside>
  )
}
