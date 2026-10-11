import type { Paper } from '#site/content'
import { RecordDay, RecordPanel, RecordRow } from '@/components/ui/record-panel'
import { AuthorList } from './author-list'
import { PaperLinks, doiId, paperLinks } from './paper-links'
import { paperDay, statusLabel } from './status'

interface PaperMetaPanelProps {
  paper: Paper
}

// Bibliographic record for a paper: who, when, where, status, identifiers.
export function PaperMetaPanel({ paper }: PaperMetaPanelProps) {
  return (
    <RecordPanel
      label="Paper metadata"
      source={`${paper.slug}.mdx`}
      footer={paperLinks(paper).length > 0 ? <PaperLinks paper={paper} /> : undefined}
    >
      <RecordRow label={paper.authors.length === 1 ? 'author' : 'authors'}>
        <AuthorList authors={paper.authors} />
      </RecordRow>
      <RecordRow label="date">
        <RecordDay day={paperDay(paper.date)} />
      </RecordRow>
      {paper.updated && (
        <RecordRow label="rev.">
          <RecordDay day={paperDay(paper.updated)} />
        </RecordRow>
      )}
      <RecordRow label="venue">{paper.venue}</RecordRow>
      <RecordRow label="status">
        <span className="text-accent">{statusLabel(paper.status)}</span>
      </RecordRow>
      {paper.doi && (
        <RecordRow label="doi">
          <a
            href={paper.doi}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent [overflow-wrap:anywhere] transition-colors hover:text-accent-dim"
          >
            {doiId(paper.doi)}
          </a>
        </RecordRow>
      )}
    </RecordPanel>
  )
}
