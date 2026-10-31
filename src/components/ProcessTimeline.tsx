'use client'
import { motion, useScroll } from 'motion/react'
import { useRef } from 'react'
import { Reveal } from './Reveal'

/** Vertical timeline. The line draws itself as the section scrolls past; steps fade in. */
export function ProcessTimeline({ steps }: { steps: { title: string; text: string }[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  return (
    <ol ref={ref} className="relative space-y-8 pl-16">
      <span aria-hidden className="absolute bottom-2 left-[21px] top-2 w-px bg-line" />
      <motion.span aria-hidden data-timeline-line style={{ scaleY: scrollYProgress }} className="absolute bottom-2 left-[21px] top-2 w-px origin-top bg-accent" />
      {steps.map((s, i) => (
        <li key={s.title} className="relative">
          <span className="absolute -left-16 top-0 flex size-11 items-center justify-center rounded-full border border-accent bg-bg font-display text-sm font-bold text-accent">{i + 1}</span>
          <Reveal delay={0.05}>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 max-w-prose text-muted">{s.text}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
