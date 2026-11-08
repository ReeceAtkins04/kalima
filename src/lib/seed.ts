import { addDays, today } from "./date";
import type { Card, Deck, Library } from "./types";

interface SeedCard {
  arabic: string;
  transliteration: string;
  english: string;
  notes?: string;
}

function card(id: string, seed: SeedCard, state: "due" | "new" | "future", offset = 0): Card {
  const base = {
    id,
    ...seed,
    due: today(),
    intervalDays: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
  };

  if (state === "due") {
    return {
      ...base,
      due: addDays(today(), offset),
      intervalDays: 4 + Math.abs(offset),
      reps: 3 + Math.abs(offset),
      lapses: 1,
    };
  }

  if (state === "future") {
    return {
      ...base,
      due: addDays(today(), offset),
      intervalDays: offset,
      reps: 4,
      ease: 2.6,
    };
  }

  return base;
}

const msa: SeedCard[] = [
  {
    arabic: "مَدْرَسَة",
    transliteration: "madrasa",
    english: "school",
    notes: "Plural: مَدَارِس (madāris)",
  },
  {
    arabic: "كِتَاب",
    transliteration: "kitāb",
    english: "book",
    notes: "Plural: كُتُب (kutub)",
  },
  {
    arabic: "طَالِب",
    transliteration: "ṭālib",
    english: "student",
    notes: "Plural: طُلَّاب (ṭullāb)",
  },
  {
    arabic: "مَاء",
    transliteration: "māʾ",
    english: "water",
    notes: "Often written مَاءً in the accusative.",
  },
  {
    arabic: "بَيْت",
    transliteration: "bayt",
    english: "house, home",
    notes: "Plural: بُيُوت (buyūt)",
  },
  {
    arabic: "يَوْم",
    transliteration: "yawm",
    english: "day",
    notes: "Plural: أَيَّام (ayyām)",
  },
  {
    arabic: "صَدِيق",
    transliteration: "ṣadīq",
    english: "friend",
    notes: "Plural: أَصْدِقَاء (aṣdiqāʾ)",
  },
  {
    arabic: "أُسْتَاذ",
    transliteration: "ustādh",
    english: "teacher",
    notes: "Plural: أَسَاتِذَة (asātidha)",
  },
  {
    arabic: "سَيَّارَة",
    transliteration: "sayyāra",
    english: "car",
    notes: "Plural: سَيَّارَات (sayyārāt)",
  },
  {
    arabic: "لُغَة",
    transliteration: "lugha",
    english: "language",
    notes: "Plural: لُغَات (lughāt)",
  },
  {
    arabic: "جَمِيل",
    transliteration: "jamīl",
    english: "beautiful",
    notes: "Antonym: قَبِيح (qabīḥ)",
  },
  {
    arabic: "كَبِير",
    transliteration: "kabīr",
    english: "big, large",
    notes: "Antonym: صَغِير (ṣaghīr)",
  },
  {
    arabic: "طَعَام",
    transliteration: "ṭaʿām",
    english: "food",
    notes: "Related: مَطْعَم (maṭʿam) — restaurant",
  },
  {
    arabic: "مَسَاء",
    transliteration: "masāʾ",
    english: "evening",
    notes: "Opposite: صَبَاح (ṣabāḥ)",
  },
  {
    arabic: "يَكْتُبُ",
    transliteration: "yaktubu",
    english: "he writes",
    notes: "Present tense of كَتَبَ (kataba)",
  },
  {
    arabic: "يَذْهَبُ",
    transliteration: "yadhhabu",
    english: "he goes",
    notes: "Present tense of ذَهَبَ (dhahaba)",
  },
];

const quran: SeedCard[] = [
  {
    arabic: "رَبّ",
    transliteration: "rabb",
    english: "lord, sustainer",
    notes: "Root: ر-ب-ب",
  },
  {
    arabic: "قَلْب",
    transliteration: "qalb",
    english: "heart",
    notes: "Root: ق-ل-ب · Plural: قُلُوب (qulūb)",
  },
  {
    arabic: "عِلْم",
    transliteration: "ʿilm",
    english: "knowledge",
    notes: "Root: ع-ل-م",
  },
  {
    arabic: "نُور",
    transliteration: "nūr",
    english: "light",
    notes: "Root: ن-و-ر",
  },
  {
    arabic: "رَحْمَة",
    transliteration: "raḥma",
    english: "mercy",
    notes: "Root: ر-ح-م",
  },
  {
    arabic: "صَبْر",
    transliteration: "ṣabr",
    english: "patience",
    notes: "Root: ص-ب-ر",
  },
  {
    arabic: "أَرْض",
    transliteration: "arḍ",
    english: "earth, land",
    notes: "Root: أ-ر-ض · Plural: أَرَاضٍ (arāḍin)",
  },
  {
    arabic: "سَمَاء",
    transliteration: "samāʾ",
    english: "sky, heaven",
    notes: "Root: س-م-و · Plural: سَمَاوَات (samāwāt)",
  },
  {
    arabic: "كِتَاب",
    transliteration: "kitāb",
    english: "book, scripture",
    notes: "Root: ك-ت-ب · Plural: كُتُب (kutub)",
  },
  {
    arabic: "يَوْم",
    transliteration: "yawm",
    english: "day",
    notes: "Root: ي-و-م · Plural: أَيَّام (ayyām)",
  },
  {
    arabic: "هُدَى",
    transliteration: "hudā",
    english: "guidance",
    notes: "Root: ه-د-ي",
  },
  {
    arabic: "إِيمَان",
    transliteration: "īmān",
    english: "faith",
    notes: "Root: أ-م-ن",
  },
  {
    arabic: "عَبْد",
    transliteration: "ʿabd",
    english: "servant, worshipper",
    notes: "Plural: عِبَاد (ʿibād)",
  },
  {
    arabic: "ذِكْر",
    transliteration: "dhikr",
    english: "remembrance",
    notes: "Root: ذ-ك-ر",
  },
  {
    arabic: "حَيَاة",
    transliteration: "ḥayāh",
    english: "life",
    notes: "Root: ح-ي-ي · Opposite: مَوْت (mawt)",
  },
  {
    arabic: "مَوْت",
    transliteration: "mawt",
    english: "death",
    notes: "Root: م-و-ت · Opposite: حَيَاة (ḥayāh)",
  },
];

function buildDeck(
  id: string,
  name: string,
  arabicName: string,
  description: string,
  words: SeedCard[],
  dueCount: number,
): Deck {
  const cards = words.map((word, index) => {
    if (index < dueCount) {
      const offsets = [-1, 0, -2, 0, -1, 0, -3, 0];
      return card(`${id}-${index + 1}`, word, "due", offsets[index] ?? 0);
    }
    if (index < dueCount + 4) {
      return card(`${id}-${index + 1}`, word, "new");
    }
    return card(`${id}-${index + 1}`, word, "future", 2 + (index % 5));
  });

  return { id, name, arabicName, description, cards };
}

export function createSeedLibrary(): Library {
  const date = today();

  return {
    version: 1,
    activeDeckId: "msa",
    settings: {
      newPerDay: 10,
      sessionSize: 12,
      dailyGoal: 20,
      showTransliteration: true,
      theme: "system",
    },
    decks: [
      buildDeck(
        "msa",
        "MSA Essentials",
        "أساسيات الفصحى",
        "High-frequency Modern Standard Arabic for everyday conversation.",
        msa,
        6,
      ),
      buildDeck(
        "quran",
        "Qur'anic Frequency",
        "مفردات قرآنية",
        "Recurring words that unlock Quranic reading comprehension.",
        quran,
        5,
      ),
    ],
    stats: {
      today: date,
      totalReviews: 128,
      streak: 4,
      days: {
        [addDays(date, -6)]: { reviews: 13, newCards: 4, again: 2 },
        [addDays(date, -5)]: { reviews: 8, newCards: 2, again: 1 },
        [addDays(date, -4)]: { reviews: 0, newCards: 0, again: 0 },
        [addDays(date, -3)]: { reviews: 11, newCards: 3, again: 2 },
        [addDays(date, -2)]: { reviews: 6, newCards: 1, again: 0 },
        [addDays(date, -1)]: { reviews: 14, newCards: 4, again: 3 },
        [addDays(date, 0)]: { reviews: 9, newCards: 2, again: 1 },
      },
    },
  };
}
