// FIX: Replaced the file content which incorrectly contained constants and a circular import.
// This file now only defines and exports the application's types, which resolves numerous
// compilation errors across the project.

// Supported languages
export type Language = 'en' | 'nl' | 'zh';

// All waste categories
export type WasteType = 'gft' | 'pmd' | 'rest' | 'papier' | 'glas' | 'kca' | 'textiel' | 'e-waste' | 'grofvuil';

// Item for the sorting game
export interface GameItem {
    nameKey: string;
    image: string;
    imageEmoji?: string; // Emoji fallback if image fails to load
    type: WasteType;
}

// Term for the glossary
export interface GlossaryTerm {
    termKey: WasteType;
    definitionKey: string;
}

// Item for the searchable waste list
export interface SearchableWasteItem {
    type: WasteType;
    en: string;
    nl: string;
    zh: string;
    disposal_info: string | null;
}

// Chat message structure
export interface Message {
    sender: 'user' | 'bot';
    text: string;
    sources?: { uri: string; title: string }[];
}

// High score entry for the game
export interface ScoreEntry {
    nickname: string;
    score: number;
}
