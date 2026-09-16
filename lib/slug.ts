/** Gera slug amigável: minúsculas, sem acentos, palavras separadas por hífen. */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'item'
}

/**
 * Garante slug único: se o base já estiver em uso, tenta base-2, base-3...
 * Passe `ignoreSlug` para permitir que o item mantenha o próprio slug ao editar.
 */
export function uniqueSlug(baseTitle: string, takenSlugs: Iterable<string>, ignoreSlug?: string): string {
  const taken = new Set(takenSlugs)
  if (ignoreSlug) taken.delete(ignoreSlug)
  const base = slugify(baseTitle)
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/** URL pública canônica de um item do portfólio. */
export function portfolioPublicPath(slug: string): string {
  return `/portfolio/${slug}`
}
