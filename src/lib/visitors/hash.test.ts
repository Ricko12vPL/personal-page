import { describe, expect, it } from 'vitest'
import { addressKey, dedupeKey, sha256Hex } from './hash'

const IP = '203.0.113.7'
const UA = 'Mozilla/5.0 (Macintosh) Chrome/141'
const DAY = '2026-10-11'
const SALT = 'pepper'

describe('sha256Hex', () => {
  it('matches the known SHA-256 test vector', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })
})

describe('dedupeKey', () => {
  const key = dedupeKey(IP, UA, DAY, SALT)

  it('is a 64-char lowercase hex digest', () => {
    expect(key).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic', () => {
    expect(dedupeKey(IP, UA, DAY, SALT)).toBe(key)
  })

  it('never contains the raw IP or user agent', () => {
    expect(key).not.toContain(IP)
    expect(key).not.toContain('Mozilla')
  })

  it.each([
    ['ip', dedupeKey('203.0.113.8', UA, DAY, SALT)],
    ['user agent', dedupeKey(IP, `${UA} Edg`, DAY, SALT)],
    ['day', dedupeKey(IP, UA, '2026-10-12', SALT)],
    ['salt', dedupeKey(IP, UA, DAY, 'other')],
  ])('changes when the %s changes', (_, other) => {
    expect(other).not.toBe(key)
  })

  it('cannot be forged by shifting text between fields', () => {
    expect(dedupeKey('1.2.3.4', 'ab', DAY, SALT)).not.toBe(dedupeKey('1.2.3.4a', 'b', DAY, SALT))
  })
})

describe('addressKey', () => {
  const key = addressKey(IP, DAY, SALT)

  it('is a deterministic 64-char hex digest without the raw IP', () => {
    expect(key).toMatch(/^[0-9a-f]{64}$/)
    expect(addressKey(IP, DAY, SALT)).toBe(key)
    expect(key).not.toContain(IP)
  })

  it('ignores the user agent, so rotating it cannot dodge the throttle', () => {
    expect(addressKey(IP, DAY, SALT)).not.toBe(dedupeKey(IP, UA, DAY, SALT))
    expect(addressKey(IP, DAY, SALT)).not.toBe(dedupeKey(IP, '', DAY, SALT))
  })

  it.each([
    ['ip', addressKey('203.0.113.8', DAY, SALT)],
    ['day', addressKey(IP, '2026-10-12', SALT)],
    ['salt', addressKey(IP, DAY, 'other')],
  ])('changes when the %s changes', (_, other) => {
    expect(other).not.toBe(key)
  })
})
