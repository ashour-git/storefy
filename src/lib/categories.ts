export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'collection';
}

export function sanitizeCategoryInput(input: { name?: unknown; slug?: unknown; description?: unknown; image?: unknown; sortOrder?: unknown }) {
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 120) : '';
  const slug = typeof input.slug === 'string' && input.slug.trim() ? slugify(input.slug) : slugify(name);
  const description = typeof input.description === 'string' ? input.description.trim().slice(0, 1000) : '';
  const image = typeof input.image === 'string' ? input.image.trim().slice(0, 1000) : '';
  const sortOrder = Math.max(0, Math.min(9999, Number(input.sortOrder) || 0));

  if (!name) throw new Error('Collection name is required');
  return { name, slug, description: description || null, image: image || null, sortOrder };
}
