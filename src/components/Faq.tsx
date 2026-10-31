import { Reveal } from './Reveal'

/** Native <details> accordion: works without JavaScript and is keyboard accessible. */
export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-3xl border border-line bg-surface">
      {items.map((f, i) => (
        <Reveal key={f.question + i}>
          <details className="group px-5 py-1 md:px-7">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
              {f.question}
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-lg transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="pb-5 pr-10 text-muted">{f.answer}</p>
          </details>
        </Reveal>
      ))}
    </div>
  )
}
