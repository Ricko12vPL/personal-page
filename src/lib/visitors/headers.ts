/** The read side of `Headers` — lets the helpers accept any header source. */
export interface HeaderReader {
  get(name: string): string | null
}
