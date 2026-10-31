export function SectionHead({ title, sub, eyebrow, center = false }: { title: string; sub?: string; eyebrow?: string; center?: boolean }) {
  return (
    <div className={`mb-10 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted">{sub}</p>}
    </div>
  )
}

export function Section({ children, className = '', id, tone }: { children: React.ReactNode; className?: string; id?: string; tone?: 'surface' }) {
  return (
    <section id={id} className={`py-14 md:py-20 ${tone === 'surface' ? 'border-y border-line bg-surface' : ''} ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  )
}

export function PageHero({ title, sub, eyebrow }: { title: string; sub?: string; eyebrow?: string }) {
  return (
    <section className="border-b border-line">
      <div className="container-x py-12 md:py-20">
        {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">{eyebrow}</p>}
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {sub && <p className="mt-4 max-w-2xl text-lg text-muted">{sub}</p>}
      </div>
    </section>
  )
}
