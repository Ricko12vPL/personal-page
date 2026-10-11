/** Body of GET /api/seen. */
export interface SeenResponse {
  /** Current UTC hour, "YYYY-MM-DDTHH". */
  hour: string
  /** Visitors per hour, oldest → newest; null for hours before `since`. */
  hours: (number | null)[]
  /** All-time unique visits. */
  total: number
  /** First hour the counter recorded, "YYYY-MM-DDTHH". */
  since: string
}
