import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, query, orderByChild, limitToLast, get } from 'firebase/database';

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
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
