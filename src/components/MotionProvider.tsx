'use client'
import { domAnimation, LazyMotion } from 'motion/react'

/** Loads only the small set of Motion features the site uses (scroll reveal, hover). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
}
