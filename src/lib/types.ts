export type Grade = "again" | "hard" | "good" | "easy";

export type ThemePreference = "system" | "light" | "dark";

export type Screen = "home" | "words" | "settings" | "review" | "summary";

export type Tab = "home" | "words" | "settings";

export interface Card {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  notes?: string;
  due: string;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
}

export interface Deck {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  cards: Card[];
}

export interface Settings {
  newPerDay: number;
  sessionSize: number;
  dailyGoal: number;
  showTransliteration: boolean;
  theme: ThemePreference;
}

export interface DayStats {
  reviews: number;
  newCards: number;
  again: number;
}

export interface LibraryStats {
  today: string;
  days: Record<string, DayStats>;
  totalReviews: number;
  streak: number;
}

export interface Library {
  version: 1;
  decks: Deck[];
  settings: Settings;
  activeDeckId: string;
  stats: LibraryStats;
}

export interface HomeStats {
  due: number;
  newCards: number;
  newRemaining: number;
  learned: number;
  total: number;
  progress: number;
  reviewsToday: number;
  goal: number;
  goalProgress: number;
  streak: number;
  accuracy: number;
  week: { date: string; reviews: number; isToday: boolean }[];
  nextDue: string | null;
}

export interface SessionResult {
  reviewed: number;
  correct: number;
  again: number;
  startedAt: number;
  finishedAt: number;
  initialCount: number;
}

export interface SessionState {
  cards: Card[];
  index: number;
  revealed: boolean;
  reviewed: number;
  correct: number;
  again: number;
  initialCount: number;
  startedAt: number;
}
