import { addDays, today } from "./date";
import { persistNativeLibrary } from "./native";
import { createSeedLibrary } from "./seed";
import type {
  Card,
  DayStats,
  Deck,
  Grade,
  HomeStats,
  Library,
} from "./types";

const STORAGE_KEY = "kalima.library.v1";

export function loadLibrary(): Library {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Library;
      if (parsed?.version === 1 && Array.isArray(parsed.decks)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not load saved library, starting fresh.", error);
  }

  const seed = createSeedLibrary();
  saveLibrary(seed);
  return seed;
}

export function saveLibrary(lib: Library): void {
  try {
    const json = JSON.stringify(lib);
    localStorage.setItem(STORAGE_KEY, json);
    // Mirrored outside the library so the inline boot script can paint the
    // right background before Svelte mounts.
    localStorage.setItem("kalima.theme", lib.settings.theme);
    persistNativeLibrary(json);
  } catch (error) {
    console.warn("Could not persist library", error);
  }
}

export function getActiveDeck(lib: Library): Deck {
  return lib.decks.find((deck) => deck.id === lib.activeDeckId) ?? lib.decks[0];
}

export function ensureToday(lib: Library): DayStats {
  const date = today();
  if (lib.stats.today !== date) {
    lib.stats.today = date;
    lib.stats.days[date] ??= { reviews: 0, newCards: 0, again: 0 };
    lib.stats.streak = calculateStreak(lib.stats.days);
  }
  lib.stats.days[date] ??= { reviews: 0, newCards: 0, again: 0 };
  return lib.stats.days[date];
}

export function calculateStreak(days: Record<string, DayStats>): number {
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const date = addDays(today(), -offset);
    const stats = days[date];
    if (stats && stats.reviews > 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function computeHomeStats(lib: Library): HomeStats {
  const deck = getActiveDeck(lib);
  const date = today();
  // Pure read: this is called from a Svelte $derived, so it must not mutate.
  const day = lib.stats.days[date] ?? { reviews: 0, newCards: 0, again: 0 };
  const cards = deck?.cards ?? [];

  const due = cards.filter(
    (card) => card.reps > 0 && card.due <= date,
  ).length;
  const newPool = cards.filter((card) => card.reps === 0).length;
  const newRemaining = Math.max(0, lib.settings.newPerDay - day.newCards);
  const newCards = Math.min(newPool, newRemaining);
  const learned = cards.filter((card) => card.reps > 0).length;
  const total = cards.length;

  const future = cards
    .filter((card) => card.reps > 0 && card.due > date)
    .map((card) => card.due)
    .sort();

  const week = Array.from({ length: 7 }, (_, index) => {
    const d = addDays(date, index - 6);
    return {
      date: d,
      reviews: lib.stats.days[d]?.reviews ?? 0,
      isToday: index === 6,
    };
  });

  return {
    due,
    newCards,
    newRemaining,
    learned,
    total,
    progress: total === 0 ? 0 : learned / total,
    reviewsToday: day.reviews,
    goal: lib.settings.dailyGoal,
    goalProgress:
      lib.settings.dailyGoal === 0
        ? 0
        : Math.min(1, day.reviews / lib.settings.dailyGoal),
    streak: lib.stats.streak,
    accuracy:
      day.reviews === 0
        ? 0
        : Math.round(((day.reviews - day.again) / day.reviews) * 100),
    week,
    nextDue: future[0] ?? null,
  };
}

export function buildSession(lib: Library, deckId: string): Card[] {
  const deck = lib.decks.find((item) => item.id === deckId);
  if (!deck) return [];

  const date = today();
  const day = ensureToday(lib);

  const due = deck.cards
    .filter((card) => card.reps > 0 && card.due <= date)
    .sort((a, b) => a.due.localeCompare(b.due));

  const newRemaining = Math.max(0, lib.settings.newPerDay - day.newCards);
  const fresh = deck.cards.filter((card) => card.reps === 0).slice(0, newRemaining);

  const queue = [...due, ...fresh]
    .slice(0, Math.max(1, lib.settings.sessionSize))
    .map((card) => ({ ...card }));

  // Mix new cards in with reviews so a session doesn't feel like two halves.
  for (let i = queue.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  return queue;
}

export function gradeCard(
  lib: Library,
  deckId: string,
  cardId: string,
  grade: Grade,
): Card {
  const deck = lib.decks.find((item) => item.id === deckId);
  const card = deck?.cards.find((item) => item.id === cardId);
  if (!deck || !card) throw new Error("Card not found");

  const day = ensureToday(lib);
  const wasNew = card.reps === 0 && card.lapses === 0;

  if (wasNew) day.newCards += 1;
  day.reviews += 1;
  lib.stats.totalReviews += 1;

  if (grade === "again") {
    day.again += 1;
    card.lapses += 1;
    card.ease = clamp(card.ease - 0.2, 1.3, 2.8);
    card.intervalDays = 0;
    card.due = today();
  } else {
    const previousReps = card.reps;
    card.reps += 1;

    if (grade === "hard") {
      card.ease = clamp(card.ease - 0.15, 1.3, 2.8);
    } else if (grade === "easy") {
      card.ease = clamp(card.ease + 0.15, 1.3, 2.8);
    }

    let interval: number;
    if (previousReps === 0) {
      interval = grade === "hard" ? 1 : grade === "good" ? 1 : 3;
    } else if (previousReps === 1) {
      interval = grade === "hard" ? 2 : grade === "good" ? 3 : 5;
    } else {
      const base = Math.max(1, card.intervalDays);
      if (grade === "hard") interval = Math.max(1, Math.round(base * 1.2));
      else if (grade === "good") interval = Math.max(2, Math.round(base * card.ease));
      else interval = Math.max(4, Math.round(base * card.ease * 1.3));
    }

    card.intervalDays = interval;
    card.due = addDays(today(), interval);
  }

  lib.stats.streak = calculateStreak(lib.stats.days);
  saveLibrary(lib);
  return { ...card };
}

export function saveCard(
  lib: Library,
  deckId: string,
  input: Pick<Card, "arabic" | "transliteration" | "english"> &
    Partial<Pick<Card, "notes" | "id">>,
): Card {
  const deck = lib.decks.find((item) => item.id === deckId);
  if (!deck) throw new Error("Deck not found");

  const clean = {
    arabic: input.arabic.trim(),
    transliteration: input.transliteration.trim(),
    english: input.english.trim(),
    notes: input.notes?.trim() || undefined,
  };

  if (!clean.arabic) throw new Error("An Arabic word is required");
  if (!clean.english) throw new Error("An English meaning is required");

  const existing = input.id
    ? deck.cards.find((card) => card.id === input.id)
    : undefined;

  if (existing) {
    Object.assign(existing, clean);
    saveLibrary(lib);
    return { ...existing };
  }

  const created: Card = {
    id: `${deckId}-${Date.now().toString(36)}`,
    ...clean,
    due: today(),
    intervalDays: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
  };

  deck.cards.unshift(created);
  saveLibrary(lib);
  return { ...created };
}

export function deleteCard(lib: Library, deckId: string, cardId: string): void {
  const deck = lib.decks.find((item) => item.id === deckId);
  if (!deck) return;
  deck.cards = deck.cards.filter((card) => card.id !== cardId);
  saveLibrary(lib);
}

export function createDeck(lib: Library, name: string): Deck {
  const cleanName = name.trim() || "New deck";
  const id = `deck-${Date.now().toString(36)}`;
  const deck: Deck = {
    id,
    name: cleanName,
    arabicName: "",
    description: "",
    cards: [],
  };
  lib.decks.push(deck);
  lib.activeDeckId = id;
  saveLibrary(lib);
  return deck;
}

export interface ImportResult {
  deck: Deck;
  imported: number;
  skipped: number;
}

export function importCsv(
  lib: Library,
  name: string,
  text: string,
): ImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) throw new Error("The file is empty");

  const first = rows[0].map((cell) => cell.trim().toLowerCase());
  const hasHeader = first.some((cell) => cell === "arabic");
  const header = hasHeader ? first : [];
  const indexOf = (label: string, fallback: number) => {
    const found = header.indexOf(label);
    return found >= 0 ? found : fallback;
  };

  const arabicIndex = indexOf("arabic", 0);
  const transliterationIndex = indexOf("transliteration", 1);
  const englishIndex = indexOf("english", 2);
  const notesIndex = indexOf("notes", 3);

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const deck = createDeck(lib, name.trim() || "Imported deck");
  let imported = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const arabic = (row[arabicIndex] ?? "").trim();
    const english = (row[englishIndex] ?? "").trim();
    if (!arabic || !english) {
      skipped += 1;
      continue;
    }

    deck.cards.push({
      id: `${deck.id}-${imported}-${Date.now().toString(36)}`,
      arabic,
      transliteration: (row[transliterationIndex] ?? "").trim(),
      english,
      notes: (row[notesIndex] ?? "").trim() || undefined,
      due: today(),
      intervalDays: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
    });
    imported += 1;
  }

  if (imported === 0) {
    lib.decks = lib.decks.filter((item) => item.id !== deck.id);
    lib.activeDeckId = lib.decks[0]?.id ?? "";
    saveLibrary(lib);
    throw new Error("No valid rows found (Arabic + English are required)");
  }

  saveLibrary(lib);
  return { deck, imported, skipped };
}

export function exportCsv(lib: Library, deckId: string): string {
  const deck = lib.decks.find((item) => item.id === deckId);
  if (!deck) return "";

  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

  const lines = ["arabic,transliteration,english,notes"];
  for (const card of deck.cards) {
    lines.push(
      [
        escape(card.arabic),
        escape(card.transliteration),
        escape(card.english),
        escape(card.notes ?? ""),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function previewIntervals(card: Card): Record<Grade, string> {
  if (card.reps === 0) {
    return { again: "later", hard: "1d", good: "1d", easy: "3d" };
  }
  if (card.reps === 1) {
    return { again: "later", hard: "2d", good: "3d", easy: "5d" };
  }

  const base = Math.max(1, card.intervalDays);
  return {
    again: "later",
    hard: `${Math.max(1, Math.round(base * 1.2))}d`,
    good: `${Math.max(2, Math.round(base * card.ease))}d`,
    easy: `${Math.max(4, Math.round(base * card.ease * 1.3))}d`,
  };
}

export function resetProgress(lib: Library, deckId?: string): void {
  for (const deck of lib.decks) {
    if (deckId && deck.id !== deckId) continue;
    for (const card of deck.cards) {
      card.due = today();
      card.intervalDays = 0;
      card.ease = 2.5;
      card.reps = 0;
      card.lapses = 0;
    }
  }
  saveLibrary(lib);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((line) => line.some((cell) => cell.trim() !== ""));
}
