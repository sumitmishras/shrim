/** Everything on the CRM is in Indian time (IST, no daylight saving). */
const TZ = 'Asia/Kolkata'

export const istDate = (d: Date | string | number) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ })
export const todayIST = () => istDate(new Date())
export const istDayStart = (ymd: string) => new Date(`${ymd}T00:00:00+05:30`)
export const addDaysIST = (ymd: string, n: number) => istDate(new Date(istDayStart(ymd).getTime() + n * 86_400_000))
export const daysBetween = (fromYmd: string, toYmd: string) => Math.round((istDayStart(toYmd).getTime() - istDayStart(fromYmd).getTime()) / 86_400_000)

export function istParts(d = new Date()) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d)
  return { hour: Number(p.find((x) => x.type === 'hour')!.value) % 24, minute: Number(p.find((x) => x.type === 'minute')!.value) }
}
