// Crawlers, link unfurlers, monitors, headless browsers and HTTP libraries.
// A missed bot only inflates the count a little; a false positive would hide a
// real visitor, so every token here is something no mainstream browser sends.
const BOT_TOKENS = [
  'bot',
  'crawl',
  'spider',
  'slurp',
  'headless',
  'lighthouse',
  'preview',
  'facebookexternalhit',
  'embedly',
  'curl',
  'wget',
  'python',
  'go-http',
  'java/',
  'okhttp',
  'axios',
  'node-fetch',
  'undici',
  'uptime',
  'monitor',
  'pingdom',
  'scan',
  'vercel-screenshot',
  'phantomjs',
  'selenium',
  'puppeteer',
  'playwright',
  'httpclient',
  'libwww',
  'postman',
  'insomnia',
  'whatsapp',
  'validator',
  'inspectiontool',
  'archiver',
  'httpie',
]

const BOT_PATTERN = new RegExp(
  BOT_TOKENS.map((token) => token.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|'),
  'i',
)
const BARE_RUNTIME = /^(node|deno|bun)(\/[\d.]+)?$/i
// Brand names that contain a bot token but belong to real phones
// ("CUBOT KINGKONG 7" would otherwise match 'bot').
const BROWSER_BRANDS = /cubot/gi

export function isBot(userAgent: string | null | undefined): boolean {
  const ua = userAgent?.trim() ?? ''
  if (ua.length === 0) return true
  return BOT_PATTERN.test(ua.replace(BROWSER_BRANDS, '')) || BARE_RUNTIME.test(ua)
}
