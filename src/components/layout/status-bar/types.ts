// Shared, serialisable shapes passed from the (server) root layout to the
// (client) status bar. Keep this file free of runtime imports so both sides
// can use it.

export type ContentKind = 'project' | 'post' | 'paper'

export interface ContentEntry {
  readonly slug: string
  readonly kind: ContentKind
  /** Absolute site path, e.g. "/projects/x-quant". */
  readonly href: string
}

export interface ContentCounts {
  readonly projects: number
  readonly papers: number
  readonly posts: number
}
