/**
 * Optimized search service for handling large datasets
 */

// Debounce function to limit search frequency
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

// Function to create a search index for faster lookups
export function createSearchIndex<T>(
  items: T[],
  fields: (keyof T)[]
): Map<string, Set<number>> {
  const index = new Map<string, Set<number>>();
  
  items.forEach((item, idx) => {
    fields.forEach(field => {
      const value = item[field];
      if (value) {
        // Convert to string and lowercase for case-insensitive search
        const stringValue = String(value).toLowerCase();
        
        // Index each word separately
        stringValue.split(/\s+/).forEach(word => {
          // Skip very short words
          if (word.length < 2) return;
          
          // Add to index
          if (!index.has(word)) {
            index.set(word, new Set<number>());
          }
          index.get(word)!.add(idx);
        });
      }
    });
  });
  
  return index;
}

// Function to search using the index
export function searchWithIndex<T>(
  query: string,
  items: T[],
  index: Map<string, Set<number>>
): T[] {
  if (!query.trim()) {
    return items;
  }
  
  // Split query into words
  const words = query.toLowerCase().split(/\s+/).filter(word => word.length >= 2);
  
  if (words.length === 0) {
    return items;
  }
  
  // Find matches for each word
  const matchSets = words.map(word => {
    // Look for partial matches
    const matches = new Set<number>();
    
    index.forEach((itemIndices, indexedWord) => {
      if (indexedWord.includes(word)) {
        itemIndices.forEach(idx => matches.add(idx));
      }
    });
    
    return matches;
  });
  
  // Find items that match all words (intersection of sets)
  let resultIndices: Set<number>;
  
  if (matchSets.length > 0) {
    // Start with the first set
    resultIndices = matchSets[0];
    
    // Intersect with other sets
    for (let i = 1; i < matchSets.length; i++) {
      resultIndices = new Set(
        [...resultIndices].filter(idx => matchSets[i].has(idx))
      );
    }
  } else {
    resultIndices = new Set<number>();
  }
  
  // Convert indices back to items
  return [...resultIndices].map(idx => items[idx]);
}

// Function to perform fuzzy search for better matching
export function fuzzySearch<T>(
  query: string,
  items: T[],
  fields: (keyof T)[],
  threshold: number = 0.7
): T[] {
  if (!query.trim()) {
    return items;
  }
  
  const queryLower = query.toLowerCase();
  
  // Calculate similarity score between two strings
  const similarity = (s1: string, s2: string): number => {
    if (s1.length === 0) return s2.length === 0 ? 1 : 0;
    if (s2.length === 0) return 0;
    
    if (s1.includes(s2) || s2.includes(s1)) {
      // One is substring of the other
      return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    }
    
    // Simple character matching
    let matches = 0;
    const maxLen = Math.max(s1.length, s2.length);
    const minLen = Math.min(s1.length, s2.length);
    
    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matches++;
    }
    
    return matches / maxLen;
  };
  
  // Score each item
  const scoredItems = items.map(item => {
    let maxScore = 0;
    
    fields.forEach(field => {
      const value = item[field];
      if (value) {
        const stringValue = String(value).toLowerCase();
        const score = similarity(queryLower, stringValue);
        maxScore = Math.max(maxScore, score);
      }
    });
    
    return { item, score: maxScore };
  });
  
  // Filter by threshold and sort by score
  return scoredItems
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

// Export a combined search function that uses the most appropriate method
export function optimizedSearch<T>(
  query: string,
  items: T[],
  fields: (keyof T)[],
  index?: Map<string, Set<number>>
): T[] {
  // For very short queries, use fuzzy search
  if (query.length < 3) {
    return fuzzySearch(query, items, fields);
  }
  
  // For longer queries with index, use indexed search
  if (index) {
    return searchWithIndex(query, items, index);
  }
  
  // Fallback to fuzzy search
  return fuzzySearch(query, items, fields);
}
