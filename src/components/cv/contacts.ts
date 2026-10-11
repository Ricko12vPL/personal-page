import { siteConfig } from '@/config/site'

export interface CvContact {
  label: string
  href: string
  text: string
  external: boolean
}

/** Contact links shown in the CV rail and the contact section (screen only). */
export const CV_CONTACTS: readonly CvContact[] = [
  { label: 'Email', href: `mailto:${siteConfig.links.email}`, text: siteConfig.links.email, external: false },
  { label: 'GitHub', href: siteConfig.links.github, text: 'Ricko12vPL', external: true },
  { label: 'LinkedIn', href: siteConfig.links.linkedin, text: 'kacpersakspe', external: true },
  { label: 'LeetCode', href: siteConfig.links.leetcode, text: 'ricko12vpl', external: true },
]
