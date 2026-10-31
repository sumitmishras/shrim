/** Auto lead score (0-100). Simple rules, edit the numbers here. */
import { priorityAreas, secondaryAreas } from '@/i18n/dictionary'

export type ScoreInput = {
  timeline?: string | null
  budgetBand?: string | null
  locality?: string | null
  plotStatus?: string | null
  source?: string | null
}

const TIMELINE: Record<string, number> = { immediately: 30, '1-3-months': 20, '3-6-months': 10, exploring: 0 }
/** Having a budget band is worth 15; higher bands add a little more. */
const BUDGET_EXTRA: Record<string, number> = { 'under-10': 0, '10-25': 3, '25-50': 6, '50-100': 9, '100-plus': 12 }
const SOURCE: Record<string, number> = { 'site-visit': 10, calculator: 5 }

const hasArea = (loc: string, list: string[]) => list.some((a) => loc.toLowerCase().includes(a.toLowerCase()))

export function computeScore(l: ScoreInput) {
  let s = 0
  s += TIMELINE[l.timeline ?? ''] ?? 0
  if (l.budgetBand) s += 15 + (BUDGET_EXTRA[l.budgetBand] ?? 0)
  if (l.locality) s += hasArea(l.locality, priorityAreas) ? 15 : hasArea(l.locality, secondaryAreas) ? 8 : 0
  if (l.plotStatus === 'ready' || l.plotStatus === 'existing-building') s += 15
  s += SOURCE[l.source ?? ''] ?? 0
  return Math.min(100, s)
}

export type Band = 'hot' | 'warm' | 'cold'
export const bandFor = (score: number): Band => (score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold')
