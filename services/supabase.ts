import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not found in environment variables');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export interface LeaderboardEntry {
    name: string;
    score: number;
    timestamp: number;
    game_type?: 'sorting' | 'shooting';
}

/**
 * Add a score to the leaderboard
 */
export const addScoreToSupabase = async (
    name: string,
    score: number,
    gameType: 'sorting' | 'shooting' = 'shooting'
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('leaderboard')
            .insert({
                name: name.trim() || 'Anonymous',
                score,
                game_type: gameType,
                timestamp: Date.now()
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error adding score to Supabase:', error);
        throw error;
    }
};

/**
 * Get top scores from Supabase
 */
export const getTopScores = async (
    gameType: 'sorting' | 'shooting' = 'shooting',
    limit: number = 10
): Promise<LeaderboardEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('name, score, timestamp, game_type')
            .eq('game_type', gameType)
            .order('score', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error getting scores from Supabase:', error);
        return [];
    }
};

/**
 * Get player rank
 */
export const getPlayerRank = async (
    score: number,
    gameType: 'sorting' | 'shooting' = 'shooting'
): Promise<number> => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('score')
            .eq('game_type', gameType)
            .order('score', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            return 1;
        }

        const rank = data.findIndex(entry => entry.score <= score) + 1;
        return rank > 0 ? rank : data.length + 1;
    } catch (error) {
        console.error('Error getting player rank:', error);
        return -1;
    }
};

export default {
    addScoreToSupabase,
    getTopScores,
    getPlayerRank
};
