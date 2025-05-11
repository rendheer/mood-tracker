// Simple text analysis utilities for mood notes

// Common stop words to filter out
const STOP_WORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "just",
  "like",
  "get",
  "got",
  "getting",
  "really",
  "today",
  "day",
  "feel",
  "feeling",
  "felt",
])

// Mood-related words to highlight in analysis
const MOOD_RELATED_WORDS = {
  positive: [
    "happy",
    "joy",
    "excited",
    "grateful",
    "thankful",
    "accomplished",
    "proud",
    "relaxed",
    "peaceful",
    "calm",
    "content",
    "satisfied",
    "energetic",
    "motivated",
    "inspired",
    "loved",
    "appreciated",
    "successful",
    "optimistic",
    "hopeful",
  ],
  negative: [
    "sad",
    "angry",
    "anxious",
    "stressed",
    "tired",
    "exhausted",
    "frustrated",
    "disappointed",
    "worried",
    "overwhelmed",
    "lonely",
    "depressed",
    "upset",
    "hurt",
    "afraid",
    "scared",
    "nervous",
    "irritated",
    "annoyed",
    "regretful",
  ],
  neutral: [
    "okay",
    "fine",
    "alright",
    "neutral",
    "average",
    "normal",
    "balanced",
    "steady",
    "moderate",
    "standard",
    "typical",
    "usual",
    "regular",
    "common",
    "ordinary",
  ],
}

// Categories for word classification
export const WORD_CATEGORIES = [
  {
    name: "Work & Productivity",
    keywords: [
      "work",
      "job",
      "meeting",
      "deadline",
      "project",
      "boss",
      "colleague",
      "productivity",
      "task",
      "assignment",
      "career",
      "promotion",
      "office",
      "client",
      "email",
      "presentation",
    ],
  },
  {
    name: "Relationships",
    keywords: [
      "friend",
      "family",
      "partner",
      "relationship",
      "date",
      "conversation",
      "argument",
      "support",
      "love",
      "connection",
      "breakup",
      "marriage",
      "dating",
      "social",
      "together",
      "parents",
      "children",
      "spouse",
      "boyfriend",
      "girlfriend",
    ],
  },
  {
    name: "Health & Wellness",
    keywords: [
      "health",
      "exercise",
      "workout",
      "gym",
      "run",
      "sleep",
      "rest",
      "tired",
      "energy",
      "diet",
      "food",
      "nutrition",
      "doctor",
      "medicine",
      "illness",
      "sick",
      "pain",
      "headache",
      "meditation",
      "yoga",
    ],
  },
  {
    name: "Leisure & Hobbies",
    keywords: [
      "hobby",
      "game",
      "movie",
      "book",
      "read",
      "watch",
      "play",
      "music",
      "art",
      "creative",
      "relax",
      "fun",
      "enjoy",
      "entertainment",
      "sport",
      "travel",
      "vacation",
      "weekend",
      "party",
      "concert",
    ],
  },
  {
    name: "Stress & Challenges",
    keywords: [
      "stress",
      "anxiety",
      "worry",
      "pressure",
      "overwhelm",
      "challenge",
      "difficult",
      "hard",
      "problem",
      "issue",
      "conflict",
      "struggle",
      "fear",
      "concern",
      "trouble",
      "crisis",
      "deadline",
      "exam",
      "test",
      "financial",
    ],
  },
  {
    name: "Weather & Environment",
    keywords: [
      "weather",
      "rain",
      "sun",
      "sunny",
      "cold",
      "hot",
      "snow",
      "storm",
      "wind",
      "temperature",
      "climate",
      "season",
      "spring",
      "summer",
      "winter",
      "fall",
      "autumn",
      "nature",
      "outside",
      "environment",
    ],
  },
  {
    name: "Achievement & Goals",
    keywords: [
      "achieve",
      "goal",
      "success",
      "accomplish",
      "complete",
      "finish",
      "progress",
      "milestone",
      "improvement",
      "growth",
      "development",
      "learn",
      "skill",
      "knowledge",
      "education",
      "study",
      "grade",
      "degree",
      "certificate",
      "graduation",
    ],
  },
]

// Extract significant words from text
export function extractKeywords(text: string): string[] {
  if (!text) return []

  // Convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "")

  // Split into words and filter out stop words and short words
  const words = cleanText.split(/\s+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word))

  return words
}

// Count word frequencies
export function getWordFrequencies(words: string[]): Map<string, number> {
  const frequencies = new Map<string, number>()

  words.forEach((word) => {
    frequencies.set(word, (frequencies.get(word) || 0) + 1)
  })

  return frequencies
}

// Get top N most frequent words
export function getTopWords(frequencies: Map<string, number>, n = 10): Array<{ text: string; value: number }> {
  return Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([text, value]) => ({ text, value }))
}

// Categorize words based on predefined categories
export function categorizeWords(words: string[]): Record<string, number> {
  const categoryCounts: Record<string, number> = {}

  WORD_CATEGORIES.forEach((category) => {
    categoryCounts[category.name] = 0
  })

  words.forEach((word) => {
    WORD_CATEGORIES.forEach((category) => {
      if (category.keywords.includes(word)) {
        categoryCounts[category.name] = (categoryCounts[category.name] || 0) + 1
      }
    })
  })

  return categoryCounts
}

// Determine sentiment of words
export function analyzeSentiment(words: string[]): { positive: number; negative: number; neutral: number } {
  let positive = 0
  let negative = 0
  let neutral = 0

  words.forEach((word) => {
    if (MOOD_RELATED_WORDS.positive.includes(word)) positive++
    else if (MOOD_RELATED_WORDS.negative.includes(word)) negative++
    else if (MOOD_RELATED_WORDS.neutral.includes(word)) neutral++
  })

  return { positive, negative, neutral }
}

// Get mood emoji value as a number (for correlation)
export function getMoodValue(emoji: string): number {
  switch (emoji) {
    case "🥰":
      return 5 // Very Happy
    case "😄":
      return 4 // Happy
    case "😐":
      return 3 // Neutral
    case "😔":
      return 2 // Sad
    case "😢":
      return 1 // Very Sad
    default:
      return 0
  }
}

// Get mood name from emoji
export function getMoodName(emoji: string): string {
  switch (emoji) {
    case "🥰":
      return "Very Happy"
    case "😄":
      return "Happy"
    case "😐":
      return "Neutral"
    case "😔":
      return "Sad"
    case "😢":
      return "Very Sad"
    default:
      return "Unknown"
  }
}

// Group entries by mood
export function groupEntriesByMood(entries: Array<{ mood: string; note?: string }>): Record<string, string[]> {
  const groupedNotes: Record<string, string[]> = {
    "🥰": [], // Very Happy
    "😄": [], // Happy
    "😐": [], // Neutral
    "😔": [], // Sad
    "😢": [], // Very Sad
  }

  entries.forEach((entry) => {
    if (entry.note && entry.mood in groupedNotes) {
      groupedNotes[entry.mood].push(entry.note)
    }
  })

  return groupedNotes
}

// Find common words for each mood
export function findCommonWordsByMood(
  groupedNotes: Record<string, string[]>,
): Record<string, Array<{ text: string; value: number }>> {
  const commonWords: Record<string, Array<{ text: string; value: number }>> = {}

  Object.entries(groupedNotes).forEach(([mood, notes]) => {
    const allWords = notes.flatMap((note) => extractKeywords(note))
    const frequencies = getWordFrequencies(allWords)
    commonWords[mood] = getTopWords(frequencies, 10)
  })

  return commonWords
}

// Find categories associated with each mood
export function findCategoriesByMood(groupedNotes: Record<string, string[]>): Record<string, Record<string, number>> {
  const moodCategories: Record<string, Record<string, number>> = {}

  Object.entries(groupedNotes).forEach(([mood, notes]) => {
    const allWords = notes.flatMap((note) => extractKeywords(note))
    moodCategories[mood] = categorizeWords(allWords)
  })

  return moodCategories
}

// Generate insights based on mood patterns
export function generateInsights(
  moodEntries: Array<{ mood: string; note?: string }>,
  commonWordsByMood: Record<string, Array<{ text: string; value: number }>>,
  categoriesByMood: Record<string, Record<string, number>>,
): string[] {
  const insights: string[] = []

  // Only generate insights if we have enough data
  if (moodEntries.length < 3) {
    return ["Log more moods with notes to see insights about your patterns."]
  }

  // Count entries by mood
  const moodCounts: Record<string, number> = {}
  moodEntries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
  })

  // Find most common mood
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]

  insights.push(`Your most common mood is ${getMoodName(mostCommonMood)} (${mostCommonMood}).`)

  // Find top categories for positive moods
  const positiveCategories: Record<string, number> = {}
  if (categoriesByMood["🥰"]) {
    Object.entries(categoriesByMood["🥰"]).forEach(([category, count]) => {
      positiveCategories[category] = (positiveCategories[category] || 0) + count
    })
  }
  if (categoriesByMood["😄"]) {
    Object.entries(categoriesByMood["😄"]).forEach(([category, count]) => {
      positiveCategories[category] = (positiveCategories[category] || 0) + count
    })
  }

  const topPositiveCategory = Object.entries(positiveCategories).sort((a, b) => b[1] - a[1])[0]

  if (topPositiveCategory && topPositiveCategory[1] > 0) {
    insights.push(`When you're happy, you often mention topics related to ${topPositiveCategory[0]}.`)
  }

  // Find top categories for negative moods
  const negativeCategories: Record<string, number> = {}
  if (categoriesByMood["😔"]) {
    Object.entries(categoriesByMood["😔"]).forEach(([category, count]) => {
      negativeCategories[category] = (negativeCategories[category] || 0) + count
    })
  }
  if (categoriesByMood["😢"]) {
    Object.entries(categoriesByMood["😢"]).forEach(([category, count]) => {
      negativeCategories[category] = (negativeCategories[category] || 0) + count
    })
  }

  const topNegativeCategory = Object.entries(negativeCategories).sort((a, b) => b[1] - a[1])[0]

  if (topNegativeCategory && topNegativeCategory[1] > 0) {
    insights.push(`When you're feeling down, topics related to ${topNegativeCategory[0]} appear more frequently.`)
  }

  // Compare common words between different moods
  const happyWords = [...(commonWordsByMood["🥰"] || []), ...(commonWordsByMood["😄"] || [])]
  const sadWords = [...(commonWordsByMood["😔"] || []), ...(commonWordsByMood["😢"] || [])]

  if (happyWords.length > 0) {
    const topHappyWords = happyWords
      .slice(0, 3)
      .map((w) => w.text)
      .join(", ")
    insights.push(`Words like "${topHappyWords}" appear more often when you're feeling positive.`)
  }

  if (sadWords.length > 0) {
    const topSadWords = sadWords
      .slice(0, 3)
      .map((w) => w.text)
      .join(", ")
    insights.push(`When you're feeling down, you tend to mention "${topSadWords}" more frequently.`)
  }

  return insights
}
