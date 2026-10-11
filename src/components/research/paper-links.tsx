import type { Paper } from '#site/content'

type LinkFields = Pick<Paper, 'website' | 'pdf' | 'arxiv' | 'doi' | 'code'>

interface PaperLink {
  key: string
  label: string
  href: string
  glyph: string
}

const DOI_PREFIX = /^https?:\/\/(dx\.)?doi\.org\//i

/** `https://doi.org/10.5281/x` → `10.5281/x` (unchanged when not a doi.org URL). */
export function doiId(doi: string): string {
  return doi.replace(DOI_PREFIX, '')
}

// Only links present in the paper's frontmatter, in reading order.
export function paperLinks(paper: LinkFields): PaperLink[] {
  const candidates: ReadonlyArray<PaperLink | null> = [
    paper.website ? { key: 'website', label: 'read online', href: paper.website, glyph: '↗' } : null,
    paper.pdf ? { key: 'pdf', label: 'pdf', href: paper.pdf, glyph: '↓' } : null,
    paper.arxiv ? { key: 'arxiv', label: 'arxiv', href: paper.arxiv, glyph: '↗' } : null,
    paper.doi ? { key: 'doi', label: 'doi', href: paper.doi, glyph: '↗' } : null,
    paper.code ? { key: 'code', label: 'repo', href: paper.code, glyph: '↗' } : null,
  ]
  return candidates.filter((link): link is PaperLink => link !== null)
}

interface PaperLinksProps {
  paper: LinkFields
}

export function PaperLinks({ paper }: PaperLinksProps) {
  const links = paperLinks(paper)
  if (links.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent/60 transition-colors"
          >
            {link.label} <span aria-hidden="true">{link.glyph}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
