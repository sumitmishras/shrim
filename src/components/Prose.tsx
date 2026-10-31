import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { headingId } from '@/lib/toc'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag
    const text = node.children.map((c) => ('text' in c ? String(c.text) : '')).join('')
    return <Tag id={headingId(text)}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
})

export function Prose({ data }: { data?: unknown }) {
  if (!data) return null
  return <div className="prose-shrim"><RichText data={data as SerializedEditorState} converters={converters} /></div>
}
