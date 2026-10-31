import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'
import { img, rows } from '@/lib/media'
import { tag } from '@/lib/format'
import { serviceOf } from '@/lib/data'
import type { Project } from '@/payload-types'
import { Photo } from './Photo'
import { Reveal } from './Reveal'

export function ProjectCard({ project, locale, index = 0 }: { project: Project; locale: Locale; index?: number }) {
  const cover = rows(project.afterImages)[0] ?? rows(project.gallery)[0] ?? rows(project.beforeImages)[0] ?? img(null)
  const svc = serviceOf(project)
  return (
    <Reveal delay={(index % 3) * 0.06} className="h-full">
      <Link href={localePath(locale, `/projects/${project.slug}`)} className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          <Photo image={cover} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{tag(project.area, project.builtUpArea, svc?.title)}</p>
          <h3 className="mt-2 font-display text-lg font-semibold">{project.title}</h3>
        </div>
      </Link>
    </Reveal>
  )
}
