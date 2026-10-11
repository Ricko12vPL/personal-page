import { describe, expect, it } from 'vitest'
import { isBot } from './bot'

const BROWSERS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
  // Cubot phones: the brand contains 'bot' but these are real browsers.
  'Mozilla/5.0 (Linux; Android 12; CUBOT KINGKONG 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 10; Cubot Note 20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
]

const BOTS = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
  'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
  'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider)',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Chrome-Lighthouse',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Mozilla/5.0 (compatible; Embedly/0.2; +http://support.embed.ly/)',
  'Mozilla/5.0 (compatible; Google Web Preview)',
  'curl/8.7.1',
  'Wget/1.21.4',
  'python-requests/2.32.3',
  'Python-urllib/3.12',
  'Go-http-client/2.0',
  'Java/21.0.2',
  'okhttp/4.12.0',
  'axios/1.7.7',
  'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)',
  'node',
  'undici',
  'UptimeRobot/2.0',
  'Mozilla/5.0 (compatible; monitoring-service)',
  'Pingdom.com_bot_version_1.4_(http://www.pingdom.com/)',
  'Mozilla/5.0 (compatible; Nmap Scripting Engine; scanner)',
  'Mozilla/5.0 (Macintosh) vercel-screenshot/1.0',
  'WhatsApp/2.23.20.0',
  'PostmanRuntime/7.42.0',
  'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
]

describe('isBot', () => {
  it.each(BROWSERS)('lets a real browser through: %s', (ua) => {
    expect(isBot(ua)).toBe(false)
  })

  it.each(BOTS)('flags %s', (ua) => {
    expect(isBot(ua)).toBe(true)
  })

  it.each([null, undefined, '', '   '])('treats an empty user agent (%j) as a bot', (ua) => {
    expect(isBot(ua)).toBe(true)
  })

  it('still flags a bot that also names a Cubot phone', () => {
    expect(isBot('Mozilla/5.0 (Linux; Android 12; CUBOT X) (compatible; Googlebot/2.1)')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(isBot('MOZILLA/5.0 (COMPATIBLE; GOOGLEBOT/2.1)')).toBe(true)
  })
})
