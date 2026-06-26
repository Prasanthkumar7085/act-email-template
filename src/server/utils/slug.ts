import slugify from 'slugify'
import { nanoid } from 'nanoid'

export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true })
}

export async function uniqueSlug(
  text: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = toSlug(text)
  if (!(await exists(base))) return base

  for (let i = 0; i < 5; i++) {
    const candidate = `${base}-${nanoid(4)}`
    if (!(await exists(candidate))) return candidate
  }

  return `${base}-${nanoid(8)}`
}
