/** Tiny builder for Lexical rich-text JSON, used only by the seed script. */
type Block = ['h2' | 'h3' | 'p', string] | ['ul' | 'ol', string[]]

const text = (t: string) => ({ type: 'text', version: 1, text: t, detail: 0, format: 0, mode: 'normal', style: '' })
const base = { version: 1, direction: 'ltr', format: '', indent: 0 }

export const lexical = (blocks: Block[]) => ({
  root: {
    type: 'root', ...base,
    children: blocks.map((b) => {
      if (b[0] === 'ul' || b[0] === 'ol') {
        return {
          type: 'list', listType: b[0] === 'ul' ? 'bullet' : 'number', start: 1, tag: b[0], ...base,
          children: b[1].map((item, i) => ({ type: 'listitem', value: i + 1, ...base, children: [text(item)] })),
        }
      }
      if (b[0] === 'p') return { type: 'paragraph', textFormat: 0, ...base, children: [text(b[1] as string)] }
      return { type: 'heading', tag: b[0], ...base, children: [text(b[1] as string)] }
    }),
  },
})
export type { Block }
