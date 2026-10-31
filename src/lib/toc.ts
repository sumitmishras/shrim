export const headingId = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\p{M}-]/gu, '')

type LexNode = { type: string; tag?: string; children?: { text?: string }[] }
export function headingsOf(root?: { children?: LexNode[] } | null) {
  return (root?.children ?? [])
    .filter((n) => n.type === 'heading' && (n.tag === 'h2' || n.tag === 'h3'))
    .map((n) => { const text = (n.children ?? []).map((c) => c.text ?? '').join(''); return { text, id: headingId(text), level: n.tag === 'h3' ? 3 : 2 } })
}
