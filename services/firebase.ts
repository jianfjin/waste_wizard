import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, query, orderByChild, limitToLast, get } from 'firebase/database';

// Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
// Get these from Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet
const firebaseConfig = {
    apiKey: "AIzaSyBeOfeGzsT9NzLqbFRajz_dbhJlEqRk82A",
    authDomain: "game20250601.firebaseapp.com",
    databaseURL: "https://game20250601-default-rtdb.firebaseio.com",
    projectId: "game20250601",
    storageBucket: "game20250601.firebasestorage.app",
    messagingSenderId: "553578269459",
    appId: "1:553578269459:web:75017156f8b91d9bc3e8e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export interface LeaderboardEntry {
    name: string;
    score: number;
    timestamp: number;
    gameType?: 'sorting' | 'shooting';
}

/**
 * Add a score to the leaderboard
 */
export const addScoreToFirebase = async (
    name: string, 
    score: number, 
    gameType: 'sorting' | 'shooting' = 'shooting'
): Promise<void> => {
    try {
        const scoresRef = ref(database, `leaderboard/${gameType}`);
        const newScoreRef = push(scoresRef);
        await set(newScoreRef, {
            name: name.trim() || 'Anonymous',
            score,
            timestamp: Date.now(),
            gameType
        });
    } catch (error) {
        console.error('Error adding score to Firebase:', error);
        throw error;
    }
};

/**
 * Get top scores from Firebase
 */
export const getTopScores = async (
    gameType: 'sorting' | 'shooting' = 'shooting',
    limit: number = 10
): Promise<LeaderboardEntry[]> => {
    try {
        const scoresRef = ref(database, `leaderboard/${gameType}`);
        const topScoresQuery = query(
            scoresRef,
            orderByChild('score'),
            limitToLast(limit * 2) // Get more than needed to sort client-side
        );
        
        const snapshot = await get(topScoresQuery);
        
        if (!snapshot.exists()) {
            return [];
        }

        const scores: LeaderboardEntry[] = [];
        snapshot.forEach((childSnapshot) => {
            scores.push(childSnapshot.val());
        });

        // Sort by score (descending) and take top N
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    } catch (error) {
        console.error('Error getting scores from Firebase:', error);
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
        const scoresRef = ref(database, `leaderboard/${gameType}`);
        const snapshot = await get(scoresRef);
        
        if (!snapshot.exists()) {
            return 1;
        }

        const scores: number[] = [];
        snapshot.forEach((childSnapshot) => {
            scores.push(childSnapshot.val().score);
        });

        scores.sort((a, b) => b - a);
        const rank = scores.findIndex(s => s === score) + 1;
        return rank > 0 ? rank : scores.length + 1;
    } catch (error) {
        console.error('Error getting player rank:', error);
        return -1;
    }
};

export default {
    addScoreToFirebase,
    getTopScores,
    getPlayerRank
};
