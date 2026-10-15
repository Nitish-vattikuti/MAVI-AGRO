import { Item } from '@/data/types';

// Simple Levenshtein distance for prototype
function levenshtein(a: string, b: string): number {
    const matrix = [];
    let i, j;

    // Increment along the first column of each row
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export function fuzzySearch(items: Item[], query: string): { matches: Item[], suggestions: string[] } {
    if (!query) return { matches: items, suggestions: [] };

    const normalizedQuery = query.toLowerCase().trim();
    const exactMatches: Item[] = [];
    const fuzzyMatches: Item[] = [];
    const suggestions: string[] = [];
    const threshold = 3; // Max distance allowed

    items.forEach(item => {
        const name = item.name.toLowerCase();

        // 1. Exact or Substring match (High Confidence)
        if (name.includes(normalizedQuery)) {
            exactMatches.push(item);
            return;
        }

        // 2. Fuzzy Match (Levenshtein)
        const distance = levenshtein(normalizedQuery, name);
        if (distance <= threshold) {
            fuzzyMatches.push(item);
            // If distance is small but not exact, suggested it could be a typo
            if (distance > 0 && distance < 2) {
                suggestions.push(item.name);
            }
        }
    });

    // Combine results: Exact first, then Fuzzy
    // Remove duplicates handled by 'return' in exact match
    return {
        matches: [...exactMatches, ...fuzzyMatches],
        suggestions: [...new Set(suggestions)].slice(0, 3) // Top 3 unique suggestions
    };
}
