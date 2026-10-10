export type VisibilityMode = 'public' | 'encrypted_link' | 'passphrase';

export type StoryGenre = 'Essay' | 'Poetry' | 'Memoir' | 'Letter' | 'Short Story' | 'Philosophy';

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // Plain text or markdown formatted
  authorName: string;
  authorHandle?: string;
  createdAt: number;
  updatedAt?: number;
  genre: StoryGenre;
  coverImage?: string;
  readingTimeMinutes: number;
  wordCount: number;
  
  // Visibility & Encryption
  visibility: VisibilityMode;
  encryptionSalt?: string;
  encryptionIv?: string;
  isEncryptedPayload?: boolean;
  encryptedContent?: string; // Stored if encrypted
  passphraseHint?: string;
  
  // Interaction & Heart
  rosesCount: number;
  resonancesCount: number;
  authorToken: string; // Local device token allowing author to manage visibility
  isMemoryCornerDedication?: boolean;
  departedName?: string;
  departedRelation?: string;
}

export interface MemoryMessage {
  id: string;
  toName: string;
  relation: string; // e.g. "To my mother", "To a love I had to let go", "To a childhood friend"
  message: string;
  authorName?: string;
  lanternMood: 'amber' | 'rose' | 'starlight' | 'lavender';
  createdAt: number;
  candlesCount: number;
  rosesCount: number;
  authorToken: string;
}

export interface DailyPrompt {
  id: string;
  prompt: string;
  category: string;
  sourceInspiration: string;
}

export interface ReadingGoal {
  dailyWordTarget: number;
  dailyStoriesTarget: number;
  wordsReadToday: number;
  storiesReadToday: number;
  readStoryIdsToday: string[];
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: number;
  targetMinutes?: number;
}
