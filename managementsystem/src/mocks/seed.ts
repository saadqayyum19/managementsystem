/* Deterministic pseudo-random helpers so every reload produces identical mock data. */
function mulberry32(seed: number) {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const rng = mulberry32(20260924)

export function randomInt(min: number, max: number): number { return Math.floor(rng() * (max - min + 1)) + min }
export function randomFloat(min: number, max: number, decimals = 1): number { return Number((rng() * (max - min) + min).toFixed(decimals)) }
export function pick<T>(items: T[]): T { return items[Math.floor(rng() * items.length)] }
export function pickMany<T>(items: T[], count: number): T[] { return [...items].sort(() => rng() - 0.5).slice(0, count) }
export function round(value: number, decimals = 1): number { return Number(value.toFixed(decimals)) }

/** Anchor date for the whole dataset — every relative date is derived from it. */
export const TODAY = new Date('2026-09-24T09:00:00.000Z')

export function isoDate(date: Date): string { return date.toISOString().slice(0, 10) }
export function isoDateTime(date: Date): string { return date.toISOString().slice(0, 16).replace('T', ' ') }
export function addDays(date: Date, days: number): Date { const next = new Date(date.getTime()); next.setUTCDate(next.getUTCDate() + days); return next }
export function daysAgo(days: number): string { return isoDate(addDays(TODAY, -days)) }
export function daysAhead(days: number): string { return isoDate(addDays(TODAY, days)) }
export const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

/** Last 30 calendar days, oldest first — used for attendance + trend charts. */
export const last30Days: string[] = Array.from({ length: 30 }, (_, index) => daysAgo(29 - index))
