import { describe, expect, it } from 'vitest'
import { getGithubSnapshot, parseSnapshot } from './snapshot'
import { parseCalendar } from '../../../../scripts/github-snapshot.mjs'

const valid = {
  login: 'Ricko12vPL',
  checkedAt: '2026-10-11',
  source: { calendar: 'https://example.test/cal', profile: 'https://example.test/api' },
  profile: { publicRepos: 31, followers: 12, memberSince: '2023-01-09' },
  contributions: {
    total: 3,
    from: '2026-10-10',
    to: '2026-10-11',
    days: [
      { date: '2026-10-11', count: 3, level: 1 },
      { date: '2026-10-10', count: 0, level: 0 },
    ],
  },
}

describe('parseSnapshot', () => {
  it('accepts a well-formed snapshot and sorts days by date', () => {
    const parsed = parseSnapshot(valid)
    expect(parsed?.contributions.days.map((d) => d.date)).toEqual(['2026-10-10', '2026-10-11'])
    expect(parsed?.profile.publicRepos).toBe(31)
  })

  it('does not mutate the input', () => {
    const input = structuredClone(valid)
    parseSnapshot(input)
    expect(input).toEqual(valid)
  })

  it.each([
    ['null', null],
    ['missing login', { ...valid, login: undefined }],
    ['bad checkedAt', { ...valid, checkedAt: 'yesterday' }],
    ['negative followers', { ...valid, profile: { ...valid.profile, followers: -1 } }],
    ['no days', { ...valid, contributions: { ...valid.contributions, days: [] } }],
    [
      'level out of range',
      {
        ...valid,
        contributions: { ...valid.contributions, days: [{ date: '2026-10-11', count: 1, level: 7 }] },
      },
    ],
  ])('rejects %s', (_, input) => {
    expect(parseSnapshot(input)).toBeNull()
  })

  it('validates the committed snapshot and its total matches the days', () => {
    const snapshot = getGithubSnapshot()
    expect(snapshot).not.toBeNull()
    const sum = snapshot?.contributions.days.reduce((acc, d) => acc + d.count, 0)
    expect(sum).toBe(snapshot?.contributions.total)
  })
})

const td = (ix: number, date: string, level: number) =>
  `<td tabindex="0" data-ix="${ix}" style="width: 10px" data-date="${date}" id="contribution-day-component-0-${ix}" data-level="${level}" role="gridcell" class="ContributionCalendar-day"></td>`
const tip = (ix: number, text: string) =>
  `<tool-tip id="tooltip-${ix}" for="contribution-day-component-0-${ix}" popover="manual" class="sr-only">${text}</tool-tip>`

function calendarHtml(heading: string): string {
  return [
    `<h2 class="f4 text-normal mb-2">\n      ${heading}\n      contributions\n        in the last year\n    </h2>`,
    td(1, '2026-10-11', 2),
    td(0, '2026-10-10', 0),
    tip(0, 'No contributions on October 10th.'),
    tip(1, '1,204 contributions on October 11th.'),
  ].join('\n')
}

describe('parseCalendar (scripts/github-snapshot.mjs)', () => {
  it('pairs day cells with their tooltips and checks the heading total', () => {
    expect(parseCalendar(calendarHtml('1,204'))).toEqual({
      total: 1204,
      from: '2026-10-10',
      to: '2026-10-11',
      days: [
        { date: '2026-10-10', count: 0, level: 0 },
        { date: '2026-10-11', count: 1204, level: 2 },
      ],
    })
  })

  it('refuses a calendar whose days do not add up to the heading', () => {
    expect(() => parseCalendar(calendarHtml('1,205'))).toThrow(/Sanity check failed/)
  })

  it('refuses a day without a tooltip', () => {
    const html = calendarHtml('0').replace(/<tool-tip[^]*?for="contribution-day-component-0-1"[^]*?<\/tool-tip>/, '')
    expect(() => parseCalendar(html)).toThrow(/No tooltip/)
  })
})
