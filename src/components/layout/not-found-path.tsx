'use client'

import { useSyncExternalStore } from 'react'
import { homePath } from './status-bar/path'

const subscribeNever = () => () => {}

/**
 * The requested path as "~/…". The 404 is prerendered once, so the server
 * cannot know the URL: render a neutral "this file" for SSR / no-JS, then the
 * real path once hydrated.
 */
export function NotFoundPath() {
  const pathname = useSyncExternalStore(
    subscribeNever,
    () => window.location.pathname,
    () => null
  )
  return <>{pathname === null ? 'this file' : homePath(pathname)}</>
}
