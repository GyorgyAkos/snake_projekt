/** Egyszerű seed-elhető PRNG (NFK5 – reprodukálhatóság). Mulberry32. */
let seed = 0

export function setSeed(s: number): void {
  seed = s >>> 0
}

export function next(): number {
  seed = (seed + 0x6d2b79f5) >>> 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** [min, max] zárt intervallum egész. */
export function nextInt(min: number, max: number): number {
  return min + Math.floor(next() * (max - min + 1))
}
