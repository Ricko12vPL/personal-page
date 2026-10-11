const OWNER = 'Kacper Saks'

interface AuthorListProps {
  authors: readonly string[]
}

// Comma-separated authors with the site owner emphasised.
export function AuthorList({ authors }: AuthorListProps) {
  return (
    <>
      {authors.map((author, i) => (
        <span key={author}>
          <span className={author === OWNER ? 'text-neutral-100' : undefined}>{author}</span>
          {i < authors.length - 1 && ', '}
        </span>
      ))}
    </>
  )
}
