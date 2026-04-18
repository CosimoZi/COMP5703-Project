import type { BondPattern } from './types'
import { stretcherBond } from './stretcher'

const patterns: Map<string, BondPattern> = new Map()

export function registerBond(p: BondPattern): void {
  patterns.set(p.id, p)
}

export function getBond(id: string): BondPattern | undefined {
  return patterns.get(id)
}

export function allBonds(): BondPattern[] {
  return [...patterns.values()]
}

registerBond(stretcherBond)
// Future teammates: import your pattern module and call registerBond here.
// Example:
//   import { englishBond } from './english'
//   registerBond(englishBond)
