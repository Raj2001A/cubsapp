import Fuse from 'fuse.js';

export type FuzzySearchOptions<T> = Fuse.IFuseOptions<T>;

/**
 * Perform fuzzy search over a list of items using Fuse.js
 * @param items - The array of items to search
 * @param query - The search query string
 * @param options - Fuse.js options (e.g., keys to search)
 * @returns Filtered array of items matching the query
 */
export function fuzzySearch<T>(items: T[], query: string, options: FuzzySearchOptions<T>): T[] {
  if (!query.trim()) return items;
  const fuse = new Fuse(items, options);
  return fuse.search(query).map((result) => result.item);
}
