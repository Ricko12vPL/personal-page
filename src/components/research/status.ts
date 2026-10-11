const STATUS_LABEL: Readonly<Record<string, string>> = {
  preprint: 'Preprint',
  published: 'Published',
  'working-paper': 'Working Paper',
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

/** `YYYY-MM-DD` straight from the ISO string, so no timezone can shift the day. */
export function paperDay(date: string): string {
  return date.slice(0, 10)
}

export function paperYear(date: string): string {
  return date.slice(0, 4)
}
