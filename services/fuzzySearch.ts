import { SearchableWasteItem, Language } from '../types';

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Calculate similarity score between query and target string
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
function calculateSimilarity(query: string, target: string): number {
    const queryLower = query.toLowerCase();
    const targetLower = target.toLowerCase();

    // Exact match
    if (targetLower === queryLower) return 1.0;

    // Contains query (substring match) - high score
    if (targetLower.includes(queryLower)) {
        // Bonus for matching at the start
        if (targetLower.startsWith(queryLower)) {
            return 0.95;
        }
        return 0.85;
    }

    // Check if query words are in target
    const queryWords = queryLower.split(/\s+/);
    const targetWords = targetLower.split(/\s+/);
    
    let wordMatches = 0;
    for (const qWord of queryWords) {
        for (const tWord of targetWords) {
            if (tWord.includes(qWord) || qWord.includes(tWord)) {
                wordMatches++;
                break;
            }
        }
    }
    
    if (wordMatches > 0) {
        return 0.7 * (wordMatches / queryWords.length);
    }

    // Fuzzy match using Levenshtein distance
    const distance = levenshteinDistance(queryLower, targetLower);
    const maxLen = Math.max(queryLower.length, targetLower.length);
    
    if (maxLen === 0) return 0;
    
    const similarity = 1 - (distance / maxLen);
    
    // Only return matches with reasonable similarity
    return similarity > 0.5 ? similarity * 0.6 : 0;
}

export interface FuzzySearchResult {
    item: SearchableWasteItem;
    score: number;
}

/**
 * Perform fuzzy search on waste items
 * @param items - Array of searchable waste items
 * @param query - Search query string
 * @param language - Current language for search
 * @param threshold - Minimum score threshold (default: 0.3)
 * @returns Sorted array of matching items with scores
 */
export function fuzzySearch(
    items: SearchableWasteItem[],
    query: string,
    language: Language,
    threshold: number = 0.3
): FuzzySearchResult[] {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const results: FuzzySearchResult[] = [];

    for (const item of items) {
        const score = calculateSimilarity(query.trim(), item[language]);
        
        if (score >= threshold) {
            results.push({ item, score });
        }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results;
}
