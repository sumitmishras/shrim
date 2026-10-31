import type { Locale } from '@/i18n/config'
import { areaName, priorityAreas, secondaryAreas } from '@/i18n/dictionary'

export function AreaChips({ locale }: { locale: Locale }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {priorityAreas.map((a) => (
        <li key={a} className="rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-medium">{areaName(locale, a)}</li>
      ))}
      {secondaryAreas.map((a) => (
        <li key={a} className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted">{areaName(locale, a)}</li>
      ))}
    </ul>
  )
}
