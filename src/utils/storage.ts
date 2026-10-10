import { Story, MemoryMessage, DailyPrompt, ReadingGoal } from '../types';

const STORIES_KEY = 'sanctuary_stories_v1';
const MEMORIES_KEY = 'sanctuary_memories_v1';
const AUTHOR_TOKEN_KEY = 'sanctuary_device_author_token';

// Generated image paths
export const IMAGES = {
  heroHaven: '/src/assets/images/hero_writers_haven_1791566552472.jpg',
  memoryLanterns: '/src/assets/images/memory_corner_lanterns_1791566572278.jpg',
  editorialTypewriter: '/src/assets/images/editorial_typewriter_1791566599618.jpg',
};

export function getOrCreateAuthorToken(): string {
  let token = localStorage.getItem(AUTHOR_TOKEN_KEY);
  if (!token) {
    token = 'author_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    localStorage.setItem(AUTHOR_TOKEN_KEY, token);
  }
  return token;
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: 'p1',
    category: 'Memory & Nostalgia',
    prompt: 'Write about a room you can never return to, and the afternoon light that used to touch its floors.',
    sourceInspiration: 'Inspired by Virginia Woolf'
  },
  {
    id: 'p2',
    category: 'Unspoken Letters',
    prompt: 'Write a letter to someone who knew you before your heart broke for the first time.',
    sourceInspiration: 'Inspired by Rainer Maria Rilke'
  },
  {
    id: 'p3',
    category: 'The Craft of Living',
    prompt: 'Describe the sensation of choosing quiet joy over noisy validation in an impatient world.',
    sourceInspiration: 'Inspired by Mary Oliver'
  },
  {
    id: 'p4',
    category: 'Whispered Truths',
    prompt: 'What is the secret you keep only for the blank page?',
    sourceInspiration: 'Inspired by Joan Didion'
  }
];

const INITIAL_STORIES: Story[] = [
  {
    id: 'sanctuary-manifesto',
    title: 'The Architecture of Solitude: Why Every Writer Needs a Sacred Grove',
    subtitle: 'On creating without the fear of metrics, algorithms, or premature exposure.',
    content: `There is an antique myth that words require an audience before they can possess weight. We are taught to measure our ink in applause, our vulnerability in clicks, and our quietest realizations in the currency of public appraisal.

Yet every writer who has ever touched the marrow of truth knows the opposite: words are born in sacred quietude.

Here, in this sanctuary, the ink belongs entirely to you. You are free to write for the wide world with a single broadcast, or to cast your prose into an encrypted vessel that only the holder of your secret cipher may read. You need neither subscription nor permission to express what is burning within you.

When we strip away the noise of the digital carnival, writing returns to what it was always intended to be: a bridge between two sovereign human souls, suspended across time, sustained by honesty alone.

Take your seat at the desk. The morning light is forgiving, the parchment is infinite, and your story has waited long enough.`,
    authorName: 'Evelyn St. Claire',
    authorHandle: '@evelyn.ink',
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
    genre: 'Essay',
    coverImage: IMAGES.heroHaven,
    readingTimeMinutes: 3,
    wordCount: 198,
    visibility: 'public',
    rosesCount: 142,
    resonancesCount: 389,
    authorToken: 'editorial_curator'
  },
  {
    id: 'the-lantern-keeper',
    title: 'Letters to the Other Side of Midnight',
    subtitle: 'A meditation on those who stepped outside the room of living.',
    content: `We build monuments in stone because we fear the fragility of memory. But the dead, I have discovered, do not live inside marble or copper. They reside in the peculiar slant of tea steam on a cold Tuesday. They live in the scent of rain hitting parched lavender.

To you, who taught me how to read by the dim glow of the bedside lamp: I still hear your voice when the sentences grow tangled. You told me once that to write is to keep a promise with people who cannot speak for themselves.

Tonight, I sent another lantern across the quiet waters of our memory corner. It carries no regret — only the steady, unwaning flame of gratitude for the years when your hands shielded me from the storm.

Rest softly. The words are safe here.`,
    authorName: 'Julian Vance',
    authorHandle: '@julianvance',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    genre: 'Memoir',
    coverImage: IMAGES.memoryLanterns,
    readingTimeMinutes: 4,
    wordCount: 165,
    visibility: 'public',
    rosesCount: 268,
    resonancesCount: 512,
    authorToken: 'editorial_curator',
    isMemoryCornerDedication: true,
    departedName: 'My Father, Gregory',
    departedRelation: 'My First Teacher'
  },
  {
    id: 'vintage-keys-modern-hearts',
    title: 'The Mechanical Grace of Typed Thoughts',
    subtitle: 'Why the click of physical keys restores what infinite backspaces stole.',
    content: `There is a decisive courage required by the ribbon of a typewriter. Each key strike is an irrevocable commitment. You cannot soften the blow with a backspace; you cannot sanitize your initial hesitation.

Modern blogging often paralyzes us with endless draft states. We revise until the blood has drained out of the sentence, polishing a stone until it looks like synthetic glass.

When you write in an uncompromising sanctuary, you permit yourself the raw dignity of your first breath. Whether you publish it publicly or seal it behind an encrypted key for one destined reader, let the prose retain its sharp, beautiful pulse.`,
    authorName: 'Clara Delacroix',
    authorHandle: '@clara_poet',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    genre: 'Essay',
    coverImage: IMAGES.editorialTypewriter,
    readingTimeMinutes: 2,
    wordCount: 135,
    visibility: 'public',
    rosesCount: 89,
    resonancesCount: 210,
    authorToken: 'editorial_curator'
  }
];

const INITIAL_MEMORIES: MemoryMessage[] = [
  {
    id: 'm1',
    toName: 'Grandma Eleanor',
    relation: 'Passed on to eternity (2021)',
    message: 'You taught me that bread tastes better when shared with strangers, and that no garden is ever truly weeds if it brings honeybees. I made your sourdough yesterday, and for five minutes, the kitchen smelled like your hugs. I love you forever.',
    authorName: 'Sarah K.',
    lanternMood: 'amber',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    candlesCount: 184,
    rosesCount: 92,
    authorToken: 'demo_token'
  },
  {
    id: 'm2',
    toName: 'Mateo',
    relation: 'Lost to distance & unspoken words',
    message: 'We were eighteen and believed summer was an eternal country. Life pulled us into separate hemispheres and different lives. I never held anger toward you for leaving. I just hope wherever you are tonight, you are still playing the cello on your balcony.',
    authorName: 'L.',
    lanternMood: 'lavender',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    candlesCount: 129,
    rosesCount: 65,
    authorToken: 'demo_token'
  },
  {
    id: 'm3',
    toName: 'My sweet Oliver (The golden boy)',
    relation: 'Across the Rainbow Bridge',
    message: 'Fourteen years of waiting by the porch. You were the only one who never questioned my tears and always brought your worn tennis ball when the world felt too heavy. Sleep in the sunbeams, my good boy.',
    authorName: 'Hannah M.',
    lanternMood: 'rose',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    candlesCount: 310,
    rosesCount: 245,
    authorToken: 'demo_token'
  },
  {
    id: 'm4',
    toName: 'Dad',
    relation: 'Departed 2024',
    message: 'We were both stubborn men who didn’t know how to apologize without looking at our shoes. Now that the room is empty, all the arguments feel so trivial. I forgive you for what you couldn’t give, and I thank you for everything you did.',
    authorName: 'Marcus T.',
    lanternMood: 'starlight',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    candlesCount: 172,
    rosesCount: 88,
    authorToken: 'demo_token'
  }
];

export function getStories(): Story[] {
  try {
    const raw = localStorage.getItem(STORIES_KEY);
    if (!raw) {
      localStorage.setItem(STORIES_KEY, JSON.stringify(INITIAL_STORIES));
      return INITIAL_STORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STORIES;
  } catch {
    return INITIAL_STORIES;
  }
}

export function saveStories(stories: Story[]): void {
  try {
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  } catch (err) {
    console.error('Failed to save stories to storage', err);
  }
}

export function getStoryById(id: string): Story | undefined {
  const stories = getStories();
  return stories.find(s => s.id === id);
}

export function upsertStory(story: Story): void {
  const stories = getStories();
  const existingIdx = stories.findIndex(s => s.id === story.id);
  if (existingIdx >= 0) {
    stories[existingIdx] = story;
  } else {
    stories.unshift(story);
  }
  saveStories(stories);
}

export function deleteStory(id: string): void {
  const stories = getStories().filter(s => s.id !== id);
  saveStories(stories);
}

export function getMemoryMessages(): MemoryMessage[] {
  try {
    const raw = localStorage.getItem(MEMORIES_KEY);
    if (!raw) {
      localStorage.setItem(MEMORIES_KEY, JSON.stringify(INITIAL_MEMORIES));
      return INITIAL_MEMORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MEMORIES;
  } catch {
    return INITIAL_MEMORIES;
  }
}

export function saveMemoryMessages(memories: MemoryMessage[]): void {
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error('Failed to save memories', err);
  }
}

export function addMemoryMessage(msg: MemoryMessage): void {
  const memories = getMemoryMessages();
  memories.unshift(msg);
  saveMemoryMessages(memories);
}

export function reactToStory(storyId: string, type: 'rose' | 'resonance'): void {
  const stories = getStories();
  const story = stories.find(s => s.id === storyId);
  if (story) {
    if (type === 'rose') story.rosesCount = (story.rosesCount || 0) + 1;
    if (type === 'resonance') story.resonancesCount = (story.resonancesCount || 0) + 1;
    saveStories(stories);
  }
}

export function reactToMemory(memoryId: string, type: 'candle' | 'rose'): void {
  const memories = getMemoryMessages();
  const mem = memories.find(m => m.id === memoryId);
  if (mem) {
    if (type === 'candle') mem.candlesCount = (mem.candlesCount || 0) + 1;
    if (type === 'rose') mem.rosesCount = (mem.rosesCount || 0) + 1;
    saveMemoryMessages(memories);
  }
}

// --- Personal Reading Goals & Visual Tracker Storage ---

const READING_GOALS_KEY = 'sanctuary_reading_goals_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultReadingGoal(): ReadingGoal {
  return {
    dailyWordTarget: 1200,
    dailyStoriesTarget: 2,
    wordsReadToday: 0,
    storiesReadToday: 0,
    readStoryIdsToday: [],
    lastActiveDate: getTodayDateString(),
    streakDays: 1,
    targetMinutes: 10
  };
}

export function getReadingGoal(): ReadingGoal {
  try {
    const raw = localStorage.getItem(READING_GOALS_KEY);
    const today = getTodayDateString();
    if (!raw) {
      const def = getDefaultReadingGoal();
      localStorage.setItem(READING_GOALS_KEY, JSON.stringify(def));
      return def;
    }

    const parsed: ReadingGoal = JSON.parse(raw);

    // If day rolled over
    if (parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate streak: if difference is 1 day and they had met target yesterday
      const metGoalYesterday =
        parsed.wordsReadToday >= parsed.dailyWordTarget ||
        parsed.storiesReadToday >= parsed.dailyStoriesTarget;

      const newStreak = diffDays === 1 && metGoalYesterday ? parsed.streakDays + 1 : (diffDays === 1 ? parsed.streakDays : 1);

      parsed.lastActiveDate = today;
      parsed.wordsReadToday = 0;
      parsed.storiesReadToday = 0;
      parsed.readStoryIdsToday = [];
      parsed.streakDays = newStreak;

      saveReadingGoal(parsed);
    }

    return parsed;
  } catch {
    return getDefaultReadingGoal();
  }
}

export function saveReadingGoal(goal: ReadingGoal): void {
  try {
    localStorage.setItem(READING_GOALS_KEY, JSON.stringify(goal));
  } catch (err) {
    console.error('Failed to save reading goal', err);
  }
}

export function recordStoryRead(storyId: string, wordCount: number): ReadingGoal {
  const goal = getReadingGoal();
  if (!goal.readStoryIdsToday.includes(storyId)) {
    goal.readStoryIdsToday.push(storyId);
    goal.storiesReadToday += 1;
    goal.wordsReadToday += Math.max(1, wordCount);
    saveReadingGoal(goal);
  }
  return goal;
}

export function addReadingWords(words: number): ReadingGoal {
  const goal = getReadingGoal();
  goal.wordsReadToday += Math.max(0, words);
  saveReadingGoal(goal);
  return goal;
}
