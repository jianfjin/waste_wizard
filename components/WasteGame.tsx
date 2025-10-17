import React, { useState, useEffect, useContext, useRef } from 'react';
import { LanguageContext } from '../App';
import { SEARCHABLE_WASTE_LIST, WASTE_BINS } from '../constants';
import { GameItem, ScoreEntry, WasteType } from '../types';
import { TrophyIcon, CorrectIcon, IncorrectIcon } from './Icons';
import { selectRandomWasteItems } from '../services/wasteItemMapper';

// Create a single AudioContext to be reused
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playSound = (type: 'correct' | 'incorrect') => {
    if (!audioCtx) return;

    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'correct') {
            // A cheerful, rising tone for a correct answer
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        } else {
            // A dissonant, falling tone for an incorrect answer
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        }

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (error) {
        console.error("Failed to play sound:", error);
    }
};


const WasteGame: React.FC = () => {
    const { language, t } = useContext(LanguageContext);
    const [items, setItems] = useState<GameItem[]>(() => selectRandomWasteItems(SEARCHABLE_WASTE_LIST, 20, language));
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [incorrectAnswerInfo, setIncorrectAnswerInfo] = useState<{ correctBin: WasteType } | null>(null);
    const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
    const [nickname, setNickname] = useState('');
    const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);
    const [usedItemNames, setUsedItemNames] = useState<string[]>([]);

    const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Load high scores from local storage
        try {
            const savedScores = localStorage.getItem('wasteWizardHighScores');
            if (savedScores) {
                setHighScores(JSON.parse(savedScores));
            }
        } catch (error) {
            console.error("Failed to load high scores:", error);
        }
    }, []);

    useEffect(() => {
        // Regenerate items when language changes
        if (gameState === 'playing') {
            setItems(selectRandomWasteItems(SEARCHABLE_WASTE_LIST, 20, language, usedItemNames));
            setCurrentItemIndex(0);
            setImageError(false); // Reset image error state
        }
    }, [language]);

    useEffect(() => {
        // Reset image error when item changes
        setImageError(false);
    }, [currentItemIndex]);

    const saveHighScores = (scores: ScoreEntry[]) => {
        try {
            const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);
            setHighScores(sortedScores);
            localStorage.setItem('wasteWizardHighScores', JSON.stringify(sortedScores));
        } catch (error) {
            console.error("Failed to save high scores:", error);
        }
    };

    const handleDrop = (binType: WasteType) => {
        if (!draggedItem || feedback) return;

        if (draggedItem.type === binType) {
            setScore(prev => prev + 1);
            setFeedback('correct');
            playSound('correct');
            setIncorrectAnswerInfo(null);
        } else {
            setFeedback('incorrect');
            playSound('incorrect');
            setIncorrectAnswerInfo({ correctBin: draggedItem.type });
        }

        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }

        feedbackTimeoutRef.current = setTimeout(() => {
            setFeedback(null);
            setIncorrectAnswerInfo(null);
            if (currentItemIndex < items.length - 1) {
                setCurrentItemIndex(prev => prev + 1);
            } else {
                setGameState('finished');
            }
        }, 2000); // Increased timeout to allow reading feedback
        setDraggedItem(null);
    };

    const handleDragStart = (item: GameItem) => {
        if (feedback) return;
        setDraggedItem(item);
    };

    const handleRestart = () => {
        // Track the item names from current game to exclude them in next game
        const currentItemNames = items.map(item => {
            // Find the original waste item by matching the name in the current language
            const wasteItem = SEARCHABLE_WASTE_LIST.find(w => w[language] === item.nameKey);
            return wasteItem ? wasteItem.nl : ''; // Use Dutch name for tracking
        }).filter(name => name !== '');
        
        // Combine with previously used items, but limit to reasonable amount
        const allUsedNames = [...usedItemNames, ...currentItemNames];
        const maxTrackedItems = Math.min(SEARCHABLE_WASTE_LIST.length - 20, 100); // Keep tracking reasonable
        const updatedUsedNames = allUsedNames.slice(-maxTrackedItems);
        
        setUsedItemNames(updatedUsedNames);
        setItems(selectRandomWasteItems(SEARCHABLE_WASTE_LIST, 20, language, updatedUsedNames));
        setCurrentItemIndex(0);
        setScore(0);
        setGameState('playing');
        setFeedback(null);
        setNickname('');
        setIncorrectAnswerInfo(null);
        setImageError(false);
    };

    const handleSaveScore = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            const newScore: ScoreEntry = { nickname: nickname.trim(), score };
            saveHighScores([...highScores, newScore]);
            setNickname('SAVED'); 
        }
    };
    
    const currentItem = items[currentItemIndex];
    const currentItemName = currentItem.nameKey; // Now using actual name instead of translation key

    if (gameState === 'finished') {
        const canSaveScore = score > 0 && (highScores.length < 5 || score > (highScores[highScores.length - 1]?.score ?? 0)) && nickname !== 'SAVED';
        return (
            <div className="text-center p-4">
                <h2 className="text-3xl font-bold text-green-700 mb-4">{t('finalScore')}: {score}/{items.length}</h2>
                <button onClick={handleRestart} className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors mb-6">{t('playAgain')}</button>
                
                <div className="max-w-md mx-auto">
                    {canSaveScore && (
                        <form onSubmit={handleSaveScore} className="mb-6 flex flex-col sm:flex-row gap-2">
                           <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder={t('enterNickname')}
                                className="flex-grow p-2 border rounded-md"
                                maxLength={15}
                            />
                            <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors" disabled={!nickname.trim()}>
                                {t('saveScore')}
                            </button>
                        </form>
                    )}
                    <div className="text-center font-bold text-gray-700 bg-yellow-200 py-1 px-4 rounded-full inline-block mb-4">
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                            <TrophyIcon /> {t('highScores')}
                        </h3>
                    </div>
                    <ul className="space-y-2 text-left">
                        {highScores.map((entry, index) => (
                            <li key={index} className="flex justify-between p-3 bg-yellow-50 rounded-md text-gray-800">
                                <span className="font-bold text-gray-900">{index + 1}. {entry.nickname}</span>
                                <span className="font-semibold">{entry.score}</span>
                            </li>
                        ))}
                         {highScores.length === 0 && <p className="text-center text-gray-500">No high scores yet!</p>}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4 relative min-h-[50vh]">
             <div className="absolute top-0 right-0 bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg">
                {t('score')}: {score}
            </div>
             <h2 className="text-2xl font-bold text-green-700 mb-2">{t('gameTitle')}</h2>
             <p className="text-gray-600 mb-4 text-center">{t('gameIntro')}</p>
             
             <div className="relative flex-grow flex flex-col justify-center items-center w-full">
                {feedback && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center p-4 text-center">
                        {feedback === 'correct' ? <CorrectIcon /> : <IncorrectIcon />}
                        {feedback === 'incorrect' && incorrectAnswerInfo && (
                            <p className="mt-4 text-lg font-bold text-red-600 bg-white/80 p-2 rounded-md">
                                {t('gameCorrectBinMessage').replace('{binName}', t(WASTE_BINS[incorrectAnswerInfo.correctBin].nameKey))}
                            </p>
                        )}
                    </div>
                )}

                <div className={`mb-8 p-4 border-2 border-dashed border-gray-400 rounded-lg transition-opacity duration-300 ${feedback ? 'opacity-30' : ''}`}>
                    <div 
                        draggable={!feedback}
                        onDragStart={() => handleDragStart(currentItem)}
                        className={`w-32 h-32 flex items-center justify-center ${!feedback ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        title={currentItemName}
                    >
                       {!imageError ? (
                           <img 
                               src={currentItem.image} 
                               alt={currentItemName}
                               className="w-full h-full object-contain"
                               onError={() => setImageError(true)}
                           />
                       ) : (
                           <div className="text-7xl">
                               {currentItem.imageEmoji || '📦'}
                           </div>
                       )}
                    </div>
                    <p className="text-center mt-2 font-semibold text-gray-700">{currentItemName}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                    {Object.entries(WASTE_BINS).map(([key, bin]) => {
                        const isIncorrectChoice = feedback === 'incorrect';
                        const isCorrectBin = incorrectAnswerInfo?.correctBin === key;
                        return (
                            <div 
                                key={key}
                                onDrop={() => handleDrop(key as WasteType)}
                                onDragOver={(e) => e.preventDefault()}
                                className={`${bin.color} text-white p-2 rounded-lg text-center font-bold flex flex-col justify-center items-center h-28 text-sm sm:text-base transition-all duration-300
                                ${isIncorrectChoice ? (isCorrectBin ? 'ring-4 ring-offset-2 ring-green-500 animate-pulse' : 'opacity-30') : 'transform hover:scale-105'}
                                `}
                            >
                                {t(bin.nameKey)}
                            </div>
                        )
                    })}
                </div>
             </div>
        </div>
    );
};

export default WasteGame;