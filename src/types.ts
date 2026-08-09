export type LessonCategory = 'vocabulary' | 'grammar' | 'listening';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  level: CEFRLevel;
  streak: number;
  xp: number;
  completedLessons: string[];
  isGuest?: boolean;
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export interface GrammarSection {
  id: string;
  title: string;
  explanation: string;
  formula?: string;
  examples: {
    english: string;
    vietnamese: string;
  }[];
}

export interface ListeningScript {
  title: string;
  topic: string;
  audioUrl?: string;
  fullText: string;
  lines: {
    speaker: string;
    english: string;
    vietnamese: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  topic?: string;
  level: CEFRLevel;
  description: string;
  durationMinutes: number;
  imageUrl?: string;
  vocabularyItems?: VocabularyItem[];
  grammarSections?: GrammarSection[];
  listeningScript?: ListeningScript;
  quizQuestions: QuizQuestion[];
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  xp: number;
  streakDays: number;
  completedLessonIds: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  savedVocab: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string;
  correction?: string;
  suggestedReply?: string;
  timestamp: string;
}

export interface NextJsSetupDocs {
  envExample: string;
  prismaSchema: string;
  nextAuthRoute: string;
  lessonAction: string;
}
