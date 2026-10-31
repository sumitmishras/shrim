import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'

/** Plain GET form: no JavaScript needed. It opens the calculator with the values pre-filled. */
export function CalcTeaser({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const h = t.home_
  const field = 'mt-1 block min-h-[48px] w-full rounded-xl border border-line bg-bg px-4 text-base'
  return (
    <form action={localePath(locale, '/cost-calculator')} method="get" className="card grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-8">
      <label className="text-sm font-medium">{h.area}
        <input name="area" type="number" inputMode="numeric" min={100} max={50000} required placeholder="1800" className={field} />
      </label>
      <label className="text-sm font-medium">{h.floors}
        <select name="floors" defaultValue="2" className={field}>
          {h.floorOptions.map((o, i) => <option key={o} value={i + 1}>{o}</option>)}
        </select>
      </label>
      <button type="submit" data-track="cta_click" className="btn btn-primary">{t.calculateCost}</button>
    </form>
  )
}
