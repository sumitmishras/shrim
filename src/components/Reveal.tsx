'use client'
import * as m from 'motion/react-m'

/**
 * Subtle fade-and-rise on scroll. Always renders the same markup (no hydration mismatch);
 * the reduced-motion CSS in globals.css switches the effect off for visitors who ask for it.
 */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  )
}
