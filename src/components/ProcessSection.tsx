import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { ProcessTimeline } from './ProcessTimeline'
import { Section, SectionHead } from './Section'

export function ProcessSection({ locale, title, sub }: { locale: Locale; title?: string; sub?: string }) {
  const t = getDictionary(locale)
  return (
    <Section tone="surface">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead title={title ?? t.home_.processTitle} sub={sub ?? t.home_.processSub} />
        </div>
        <ProcessTimeline steps={t.process} />
      </div>
    </Section>
  )
}
