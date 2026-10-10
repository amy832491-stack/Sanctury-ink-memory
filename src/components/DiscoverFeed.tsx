import React, { useState } from 'react';
import { Story, StoryGenre, ReadingGoal } from '../types';
import { IMAGES, DAILY_PROMPTS } from '../utils/storage';
import { ReadingGoalTracker } from './ReadingGoalTracker';
import { PenTool, Heart, Sparkles, Lock, ArrowUpRight, ShieldCheck, Feather } from 'lucide-react';

interface DiscoverFeedProps {
  stories: Story[];
  readingGoal: ReadingGoal;
  onGoalUpdated: (goal: ReadingGoal) => void;
  onSelectStory: (storyId: string) => void;
  onOpenNewStory: (initialPrompt?: string, genre?: StoryGenre) => void;
  onNavigateToMemories: () => void;
}

export const DiscoverFeed: React.FC<DiscoverFeedProps> = ({
  stories,
  readingGoal,
  onGoalUpdated,
  onSelectStory,
  onOpenNewStory,
  onNavigateToMemories,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const genres: { label: string; value: string }[] = [
    { label: 'All Chronicles', value: 'all' },
    { label: 'Essays', value: 'Essay' },
    { label: 'Poetry', value: 'Poetry' },
    { label: 'Memoirs', value: 'Memoir' },
    { label: 'Letters', value: 'Letter' },
    { label: 'Philosophy', value: 'Philosophy' },
  ];

  const filteredStories = stories.filter(s => {
    // Only public stories or author's stories appear in the public discovery feed
    if (s.visibility !== 'public') return false;
    if (selectedGenre === 'all') return true;
    return s.genre === selectedGenre;
  });

  const currentPrompt = DAILY_PROMPTS[activePromptIndex];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-16">
      
      {/* 1. Hero Split-Screen Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="text-xs font-sans tracking-widest uppercase text-stone-500 flex items-center gap-2">
            <span>Free Forever</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Knowledge Encrypted</span>
            <span aria-hidden="true">·</span>
            <span>A Writer's Paradise</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.12] tracking-tight text-balance">
            Where your words live without fear, free to the world or whispered in secret.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-sans max-w-xl leading-relaxed">
            The sanctuary for bloggers, poets, and storytellers. Express without paywalls or algorithms. Protect sensitive letters with military-grade AES-256 encrypted links, and honor departed souls in our tranquil Memory Corner.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenNewStory()}
              className="px-6 py-3.5 bg-stone-900 text-stone-50 rounded-lg font-medium text-sm hover:bg-stone-800 transition-all shadow-sm flex items-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <Feather className="w-4 h-4 text-amber-300" />
              <span>Begin Writing Free</span>
            </button>

            <button
              onClick={onNavigateToMemories}
              className="px-5 py-3.5 border border-stone-300 hover:border-amber-700 bg-white/80 hover:bg-amber-50/60 text-stone-800 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Visit The Memory Corner</span>
              <ArrowUpRight className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Right column: High-fidelity visual asset container matching height */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-stone-200/80 shadow-md group">
          <img
            src={IMAGES.heroHaven}
            alt="Warm sunlit writer desk in a quiet literary atelier"
            referrerPolicy="no-referrer"
            className="w-full h-full min-h-[360px] lg:min-h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-6 text-white">
            <p className="text-xs tracking-widest uppercase text-amber-200/90 font-medium mb-1">
              Sanctuary Atelier
            </p>
            <p className="font-serif italic text-lg sm:text-xl text-stone-100">
              "To write is to carve a quiet breathing room inside the rushing world."
            </p>
          </div>
        </div>
      </section>

      {/* 2. Full-Width Value Pillar Row below split (Disciplined spatial layout) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-stone-200/90 text-stone-800">
        <div>
          <span className="text-2xl font-serif font-semibold text-stone-950 block">100% Free</span>
          <span className="text-xs text-stone-500 font-sans">No paywalls, subscriptions, or intrusive ads</span>
        </div>
        <div>
          <span className="text-2xl font-serif font-semibold text-stone-950 block">Encrypted</span>
          <span className="text-xs text-stone-500 font-sans">Zero-knowledge AES-256 link & passkey security</span>
        </div>
        <div>
          <span className="text-2xl font-serif font-semibold text-stone-950 block">Classy Focus</span>
          <span className="text-xs text-stone-500 font-sans">Editorial typography & distraction-free studio</span>
        </div>
        <div>
          <span className="text-2xl font-serif font-semibold text-stone-950 block">Memory Garden</span>
          <span className="text-xs text-stone-500 font-sans">A tender haven for love that outlives time</span>
        </div>
      </section>

      {/* 3. Personal Reading Goals & Visual Progress Tracker */}
      <ReadingGoalTracker
        goal={readingGoal}
        onGoalUpdated={onGoalUpdated}
      />

      {/* 4. Daily Writing Prompt Spark (Interactive Blogger & Writer Spark) */}
      <section className="bg-stone-100/90 border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs text-amber-800 font-medium tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Literary Spark · {currentPrompt.category}</span>
          </div>
          <p className="text-xl sm:text-2xl font-serif text-stone-900 leading-snug">
            "{currentPrompt.prompt}"
          </p>
          <p className="text-xs text-stone-500 font-sans">
            {currentPrompt.sourceInspiration}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActivePromptIndex((prev) => (prev + 1) % DAILY_PROMPTS.length)}
            className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            New Prompt
          </button>
          <button
            onClick={() => onOpenNewStory(currentPrompt.prompt)}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write to this Prompt</span>
          </button>
        </div>
      </section>

      {/* 4. Filter Tabs & Editorial Chronicles */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-semibold">
              Curated Chronicles
            </h2>
            <p className="text-sm text-stone-500 font-sans">
              Discover honest voices, essays of wonder, and unhurried reflections.
            </p>
          </div>

          {/* Interactive filter control (functional button elements) */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
            {genres.map(g => (
              <button
                key={g.value}
                onClick={() => setSelectedGenre(g.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedGenre === g.value
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Story Grid with strict zero-pill discipline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              onClick={() => onSelectStory(story.id)}
              className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:border-amber-300/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {story.coverImage && (
                <div className="h-52 w-full overflow-hidden relative bg-stone-100">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {story.isMemoryCornerDedication && (
                    <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-200 text-xs px-2.5 py-1 rounded-md font-serif flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>Memory Corner Tribute</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Clean unboxed text metadata with typographic separators (NO PILLS) */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                    <span className="font-medium text-stone-700">{story.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.readingTimeMinutes} min read</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{story.wordCount} words</span>
                  </div>

                  <h3 className="text-xl font-serif font-semibold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug line-clamp-2">
                    {story.title}
                  </h3>

                  {story.subtitle && (
                    <p className="text-sm text-stone-600 line-clamp-2 font-sans leading-relaxed">
                      {story.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-800">{story.authorName}</span>
                    {story.authorHandle && (
                      <span className="text-stone-400">{story.authorHandle}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-stone-600 hover:text-rose-600 transition-colors">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      <span className="tabular-nums">{story.rosesCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
            <Feather className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="text-lg font-serif text-stone-800">No stories in this genre yet</h4>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              Be the first author to leave a manuscript in this section.
            </p>
            <button
              onClick={() => onOpenNewStory(undefined, selectedGenre !== 'all' ? (selectedGenre as StoryGenre) : 'Essay')}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-all cursor-pointer"
            >
              Compose {selectedGenre !== 'all' ? selectedGenre : 'Story'}
            </button>
          </div>
        )}
      </section>

      {/* 5. Memory Corner Invitation Banner */}
      <section className="bg-stone-900 text-stone-100 rounded-2xl p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 space-y-3 max-w-xl">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-sans font-medium">
            Dedicated Sacred Space
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif leading-tight">
            The Memory Corner: For Those Who Left Our Horizon
          </h2>
          <p className="text-stone-300 text-sm sm:text-base font-sans leading-relaxed">
            Send warm love messages to loved ones, departed parents, lost friends, or quiet past loves who are no longer in your life. Release a floating lantern across tranquil starlit waters.
          </p>
        </div>

        <button
          onClick={onNavigateToMemories}
          className="relative z-10 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-sm rounded-lg shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Heart className="w-4 h-4 text-rose-700 fill-rose-700" />
          <span>Enter The Memory Corner</span>
        </button>

        {/* Ambient background lantern graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
          <img
            src={IMAGES.memoryLanterns}
            alt="Lanterns in night sky"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

    </div>
  );
};
