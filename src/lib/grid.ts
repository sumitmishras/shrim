/** Card grid columns that look balanced for any item count (1 or 2 items should not leave an empty third column). */
export const cardGrid = (n: number) =>
  n <= 1 ? 'grid gap-5 sm:grid-cols-2 lg:max-w-[calc(33.333%-0.85rem)] lg:grid-cols-1'
  : n === 2 ? 'grid gap-5 sm:grid-cols-2'
  : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
