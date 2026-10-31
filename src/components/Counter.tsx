'use client'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/** Counts up to the number inside `value` (e.g. "7+" or "120") when scrolled into view. */
export function Counter({ value }: { value: string }) {
  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const reduce = useReducedMotion()
  const target = m ? parseInt(m[2].replace(/,/g, ''), 10) : 0
  const numeric = Boolean(m)
  const [n, setN] = useState(target)

  useEffect(() => {
    if (!numeric || !inView || reduce) return
    const c = animate(0, target, { duration: 1.4, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, reduce, target, numeric])

  if (!m) return <span>{value}</span>
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden>{m[1]}{n.toLocaleString('en-IN')}{m[3]}</span>
    </span>
  )
}
