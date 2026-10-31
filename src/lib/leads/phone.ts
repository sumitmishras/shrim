/** Phone helpers with no dependencies, so the forms can use them without shipping zod to the browser. */

/** "+91 98765-43210", "09876543210", "9876543210" -> "9876543210" (may still be invalid). */
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return d
}
/** Indian mobile: 10 digits, starts with 6-9. */
export const isIndianMobile = (p: string) => /^[6-9]\d{9}$/.test(p)
