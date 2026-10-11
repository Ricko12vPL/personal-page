import { describe, expect, it } from 'vitest'
import { clientIp } from './ip'

describe('clientIp', () => {
  it('takes the first x-forwarded-for hop', () => {
    const headers = new Headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1, 10.0.0.2' })
    expect(clientIp(headers)).toBe('203.0.113.7')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7', 'x-real-ip': '198.51.100.1' })
    expect(clientIp(headers)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': ' 198.51.100.1 ' }))).toBe('198.51.100.1')
  })

  it('falls back to x-real-ip when x-forwarded-for is blank', () => {
    const headers = new Headers({ 'x-forwarded-for': ' , ', 'x-real-ip': '198.51.100.1' })
    expect(clientIp(headers)).toBe('198.51.100.1')
  })

  it('handles IPv6', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '2001:db8::1' }))).toBe('2001:db8::1')
  })

  it('returns an empty string when nothing is present', () => {
    expect(clientIp(new Headers())).toBe('')
  })
})
