import React, { useState } from 'react';
import { ReadingGoal } from '../types';
import { saveReadingGoal, addReadingWords } from '../utils/storage';
import {
  BookOpen,
  CheckCircle2,
  Sliders,
  Flame,
  Sparkles,
  Trophy,
  Plus,
  X,
  Target,
  Clock
} from 'lucide-react';

interface ReadingGoalTrackerProps {
  goal: ReadingGoal;
  onGoalUpdated: (updatedGoal: ReadingGoal) => void;
}

export const ReadingGoalTracker: React.FC<ReadingGoalTrackerProps> = ({
  goal,
  onGoalUpdated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wordTargetInput, setWordTargetInput] = useState(goal.dailyWordTarget);
  const [storiesTargetInput, setStoriesTargetInput] = useState(goal.dailyStoriesTarget);
  const [manualWordsInput, setManualWordsInput] = useState(250);
  const [showManualAdd, setShowManualAdd] = useState(false);

  // Computations
  const wordPercent = Math.min(100, Math.round((goal.wordsReadToday / goal.dailyWordTarget) * 100)) || 0;
  const storiesPercent = Math.min(100, Math.round((goal.storiesReadToday / goal.dailyStoriesTarget) * 100)) || 0;
  const isGoalMet = goal.wordsReadToday >= goal.dailyWordTarget && goal.storiesReadToday >= goal.dailyStoriesTarget;
  const isWordsMet = goal.wordsReadToday >= goal.dailyWordTarget;
  const isStoriesMet = goal.storiesReadToday >= goal.dailyStoriesTarget;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReadingGoal = {
      ...goal,
      dailyWordTarget: Math.max(100, Number(wordTargetInput)),
      dailyStoriesTarget: Math.max(1, Number(storiesTargetInput)),
      targetMinutes: Math.round(Math.max(100, Number(wordTargetInput)) / 150)
    };
    saveReadingGoal(updated);
    onGoalUpdated(updated);
    setIsModalOpen(false);
  };

  const handleQuickAddWords = (words: number) => {
    const updated = addReadingWords(words);
    onGoalUpdated(updated);
    setShowManualAdd(false);
  };

  return (
    <section className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
      
      {/* Background ambient water glow when goals are achieved */}
      {isGoalMet && (
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      )}

      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-amber-800 font-sans font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Daily Literary Sanctuary & Reading Goals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Personal Reading Journey
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Feed your soul with thoughtful prose each day. Track words absorbed and chronicles finished.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualAdd(!showManualAdd)}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Log offline or external reading"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Words</span>
          </button>

          <button
            onClick={() => {
              setWordTargetInput(goal.dailyWordTarget);
              setStoriesTargetInput(goal.dailyStoriesTarget);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Goals</span>
          </button>
        </div>
      </div>

      {/* Quick Add Words Bar (Collapsible) */}
      {showManualAdd && (
        <div className="my-4 p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-700">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Read an excerpt or physical book today? Add words to your daily counter:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickAddWords(150)}
              className="px-2.5 py-1 bg-white border border-stone-300 rounded hover:bg-stone-100 font-medium cursor-pointer"
            >
              +150 words
            </button>
            <button
              onClick={() => handleQuickAddWords(350)}
              className="px-2.5 py-1 bg-white border border-stone-300 rounded hover:bg-stone-100 font-medium cursor-pointer"
            >
              +350 words
            </button>
            <button
              onClick={() => handleQuickAddWords(500)}
              className="px-2.5 py-1 bg-white border border-stone-300 rounded hover:bg-stone-100 font-medium cursor-pointer"
            >
              +500 words
            </button>
            <button
              onClick={() => setShowManualAdd(false)}
              className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Celebration Banner when daily goal is reached */}
      {isGoalMet && (
        <div className="my-5 p-4 bg-amber-500/10 border border-amber-600/30 rounded-xl flex items-center gap-3 text-amber-950">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold font-serif text-base block sm:inline mr-2">
              Daily Reading Sanctuary Achieved! ✨
            </span>
            <span className="text-amber-900/90 font-sans">
              You've nourished your mind with {goal.wordsReadToday.toLocaleString()} words and {goal.storiesReadToday} stories today.
            </span>
          </div>
        </div>
      )}

      {/* Metrics & Visual Progress Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* Metric 1: Daily Words Progress */}
        <div className="p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-sans">
            <span className="font-medium text-stone-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-stone-600" />
              <span>Words Read Today</span>
            </span>
            <span className="tabular-nums font-semibold text-stone-800">{wordPercent}%</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-950 tabular-nums">
              {goal.wordsReadToday.toLocaleString()}
            </span>
            <span className="text-xs text-stone-500 font-sans">
              / {goal.dailyWordTarget.toLocaleString()} words
            </span>
          </div>

          {/* Clean Progress Meter Bar */}
          <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isWordsMet ? 'bg-amber-500' : 'bg-stone-800'
              }`}
              style={{ width: `${wordPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
            <span>
              {isWordsMet
                ? 'Target satisfied · Keep exploring'
                : `${(goal.dailyWordTarget - goal.wordsReadToday).toLocaleString()} words remaining`}
            </span>
            {isWordsMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
        </div>

        {/* Metric 2: Stories Completed Progress */}
        <div className="p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-sans">
            <span className="font-medium text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Stories Explored</span>
            </span>
            <span className="tabular-nums font-semibold text-stone-800">{storiesPercent}%</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-950 tabular-nums">
              {goal.storiesReadToday}
            </span>
            <span className="text-xs text-stone-500 font-sans">
              / {goal.dailyStoriesTarget} {goal.dailyStoriesTarget === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {/* Clean Progress Meter Bar */}
          <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isStoriesMet ? 'bg-amber-500' : 'bg-stone-800'
              }`}
              style={{ width: `${storiesPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
            <span>
              {isStoriesMet
                ? 'Stories target reached'
                : `${Math.max(0, goal.dailyStoriesTarget - goal.storiesReadToday)} more story to read`}
            </span>
            {isStoriesMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
        </div>

        {/* Metric 3: Active Literary Streak & Time */}
        <div className="p-5 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-sans mb-1">
              <span className="font-medium text-stone-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600/20" />
                <span>Sanctuary Streak</span>
              </span>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>~{Math.round(goal.dailyWordTarget / 200)} min/day</span>
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-stone-950 tabular-nums">
                {goal.streakDays}
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {goal.streakDays === 1 ? 'day active' : 'consecutive days'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 flex items-center justify-between">
            <span>Read any chronicle today to protect your streak.</span>
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>

      </div>

      {/* Goal Setting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-stone-900">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-amber-800 font-sans font-medium">
                Personalized Reading Routine
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-950">
                Configure Reading Goals
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                Set a daily rhythm that feels inspiring and realistic for your literary journey.
              </p>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-5">
              
              {/* Daily Word Count Goal */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Daily Word Count Target
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[500, 1000, 1500, 2500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWordTargetInput(preset)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        Number(wordTargetInput) === preset
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={wordTargetInput}
                    onChange={(e) => setWordTargetInput(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:ring-1 focus:ring-amber-500 outline-none"
                    placeholder="Custom words per day..."
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 pointer-events-none">
                    words / day
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  ~{Math.round(Number(wordTargetInput) / 200)} minutes of contemplative reading.
                </p>
              </div>

              {/* Daily Stories Target */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Stories / Articles Read Per Day
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1, 2, 3, 5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStoriesTargetInput(preset)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        Number(storiesTargetInput) === preset
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {preset} {preset === 1 ? 'story' : 'stories'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={storiesTargetInput}
                  onChange={(e) => setStoriesTargetInput(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:ring-1 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Save Reading Goals
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  );
};
