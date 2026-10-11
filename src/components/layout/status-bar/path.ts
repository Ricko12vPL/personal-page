function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Next.js prerenders the 404 under this internal route name. */
const NOT_FOUND_ROUTE = '/_not-found'

/** "/projects/x-quant" → "/projects/x-quant", "/" → "" (rendered after "~"). */
export function pathAfterHome(pathname: string | null): string {
  if (!pathname || pathname === NOT_FOUND_ROUTE) return ''
  return safeDecode(pathname).replace(/\/+$/, '')
}

/** "/projects/x-quant" → "~/projects/x-quant", "/" → "~". */
export function homePath(pathname: string | null): string {
  return `~${pathAfterHome(pathname)}`
}
