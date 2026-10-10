import React, { useState } from 'react';
import { MemoryMessage } from '../types';
import { IMAGES, addMemoryMessage, reactToMemory, getOrCreateAuthorToken } from '../utils/storage';
import { ambientSoundscape } from '../utils/ambientAudio';
import {
  Heart,
  Flame,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Feather,
  Clock,
  ArrowLeft,
  X
} from 'lucide-react';

interface MemoryCornerProps {
  memories: MemoryMessage[];
  onBackToFeed: () => void;
  onRefreshMemories: () => void;
}

export const MemoryCorner: React.FC<MemoryCornerProps> = ({
  memories,
  onBackToFeed,
  onRefreshMemories
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'amber' | 'rose' | 'starlight' | 'lavender'>('all');
  const [activeMessage, setActiveMessage] = useState<MemoryMessage | null>(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // New Memory Form
  const [toName, setToName] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [lanternMood, setLanternMood] = useState<'amber' | 'rose' | 'starlight' | 'lavender'>('amber');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reactedCandles, setReactedCandles] = useState<Record<string, boolean>>({});
  const [reactedRoses, setReactedRoses] = useState<Record<string, boolean>>({});

  const handleToggleAudio = () => {
    const playing = ambientSoundscape.toggle();
    setIsAudioPlaying(playing);
  };

  const filteredMemories = memories.filter((m) => {
    if (selectedFilter === 'all') return true;
    return m.lanternMood === selectedFilter;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toName.trim() || !message.trim()) {
      alert('Please write to whom this message is addressed and your words of love.');
      return;
    }

    setIsSubmitting(true);
    const newMsg: MemoryMessage = {
      id: 'mem_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      toName: toName.trim(),
      relation: relation.trim() || 'A cherished soul',
      message: message.trim(),
      authorName: authorName.trim() || 'A grateful heart',
      lanternMood,
      createdAt: Date.now(),
      candlesCount: 1,
      rosesCount: 0,
      authorToken: getOrCreateAuthorToken()
    };

    addMemoryMessage(newMsg);
    onRefreshMemories();
    setIsSubmitting(false);
    setIsReleaseModalOpen(false);
    // Reset form
    setToName('');
    setRelation('');
    setMessage('');
    setAuthorName('');
    setActiveMessage(newMsg);
  };

  const handleLightCandle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (reactedCandles[id]) return;
    reactToMemory(id, 'candle');
    setReactedCandles((prev) => ({ ...prev, [id]: true }));
    onRefreshMemories();
  };

  const handleLeaveRose = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (reactedRoses[id]) return;
    reactToMemory(id, 'rose');
    setReactedRoses((prev) => ({ ...prev, [id]: true }));
    onRefreshMemories();
  };

  const moodColorMap = {
    amber: 'border-amber-300/80 bg-amber-500/5 hover:border-amber-400 text-amber-900',
    rose: 'border-rose-300/80 bg-rose-500/5 hover:border-rose-400 text-rose-950',
    starlight: 'border-blue-200/80 bg-sky-500/5 hover:border-sky-300 text-stone-900',
    lavender: 'border-purple-200/80 bg-purple-500/5 hover:border-purple-300 text-stone-900'
  };

  const lanternGlows = {
    amber: 'bg-amber-400/20 text-amber-500 border-amber-300',
    rose: 'bg-rose-400/20 text-rose-500 border-rose-300',
    starlight: 'bg-sky-400/20 text-sky-400 border-sky-200',
    lavender: 'bg-purple-400/20 text-purple-400 border-purple-200'
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      
      {/* 1. Header Banner & Night Lake Atmosphere */}
      <div className="relative bg-stone-950 text-white overflow-hidden py-16 lg:py-24 px-6 lg:px-12 border-b border-stone-800">
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <img
            src={IMAGES.memoryLanterns}
            alt="Floating lanterns in starry twilight"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToFeed}
              className="flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-amber-200/90 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Chronicles</span>
            </button>

            <button
              onClick={handleToggleAudio}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-700 bg-stone-900/80 text-xs font-sans text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
              <span>{isAudioPlaying ? 'Peaceful Music Playing' : 'Play Soothing Ambience'}</span>
            </button>
          </div>

          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-sans tracking-widest uppercase text-amber-300">
              The Memory Corner · Sanctuary of Unspoken Love
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
              For the souls who stepped beyond our sight, but never left our hearts.
            </h1>
            <p className="text-base sm:text-lg text-stone-300 font-sans leading-relaxed">
              Whether separated by death, distance, estrangement, or the silent passage of years — this quiet harbor is dedicated to the words you never got to finish saying. Release a floating lantern of love and peace into the stars.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsReleaseModalOpen(true)}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg font-medium text-sm shadow-md transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Flame className="w-4 h-4 text-amber-900 fill-amber-900" />
              <span>Release a Lantern of Love</span>
            </button>
            <span className="text-xs text-stone-400 font-sans">
              Free, anonymous, and forever preserved in peace.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Lantern Canopy / Floating Lantern Lake */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 space-y-10">
        
        {/* Mood filter tabs (Functional buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-stone-900">
              Floating Lanterns of Remembrance ({filteredMemories.length})
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Click any lantern to read its gentle words and leave a flame or rose.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              All Lanterns
            </button>
            <button
              onClick={() => setSelectedFilter('amber')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedFilter === 'amber' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Warm Amber
            </button>
            <button
              onClick={() => setSelectedFilter('rose')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedFilter === 'rose' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Rose Radiance
            </button>
            <button
              onClick={() => setSelectedFilter('starlight')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedFilter === 'starlight' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Starlight White
            </button>
            <button
              onClick={() => setSelectedFilter('lavender')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedFilter === 'lavender' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Lavender Dusk
            </button>
          </div>
        </div>

        {/* 3. Memory Messages Grid (With strict Zero-Pill discipline) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setActiveMessage(mem)}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer ${moodColorMap[mem.lanternMood] || 'border-stone-200 bg-white'}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${lanternGlows[mem.lanternMood]}`}>
                    <Flame className="w-4 h-4 fill-current" />
                  </div>
                  {/* Clean unboxed text metadata with typographic separator */}
                  <div className="text-xs text-stone-500 font-sans">
                    <span>{new Date(mem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-semibold text-stone-900 leading-snug">
                    {mem.toName}
                  </h3>
                  <p className="text-xs text-stone-500 font-sans italic">
                    {mem.relation}
                  </p>
                </div>

                <p className="text-sm font-serif text-stone-800 leading-relaxed line-clamp-4">
                  "{mem.message}"
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                <span className="font-sans font-medium text-stone-700">
                  From: {mem.authorName || 'Anonymous'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLightCandle(mem.id, e)}
                    className="flex items-center gap-1 hover:text-amber-700 transition-colors cursor-pointer"
                    title="Light a Candle"
                  >
                    <Flame className={`w-3.5 h-3.5 ${reactedCandles[mem.id] ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
                    <span className="tabular-nums">{mem.candlesCount}</span>
                  </button>
                  <button
                    onClick={(e) => handleLeaveRose(mem.id, e)}
                    className="flex items-center gap-1 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Leave a White Rose"
                  >
                    <Heart className={`w-3.5 h-3.5 ${reactedRoses[mem.id] ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
                    <span className="tabular-nums">{mem.rosesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Full View Lantern Detail Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl p-6 sm:p-10 max-w-xl w-full space-y-6 shadow-2xl relative text-stone-900">
            <button
              onClick={() => setActiveMessage(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-sans tracking-wider uppercase text-amber-700">
                <Flame className="w-3.5 h-3.5 fill-amber-700" />
                <span>Memory Lantern · {activeMessage.relation}</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-stone-950">
                To {activeMessage.toName}
              </h3>
            </div>

            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-inner">
              <p className="font-serif text-lg leading-relaxed text-stone-900 whitespace-pre-line italic">
                "{activeMessage.message}"
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-200 pt-4">
              <div>
                <span>Written with love by </span>
                <span className="font-semibold text-stone-800">{activeMessage.authorName || 'A gentle soul'}</span>
              </div>
              <span>{new Date(activeMessage.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLightCandle(activeMessage.id)}
                  className={`px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    reactedCandles[activeMessage.id] ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-stone-300 hover:bg-white'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span>{reactedCandles[activeMessage.id] ? 'Candle Lit' : 'Light a Candle'}</span>
                  <span className="tabular-nums font-mono">({activeMessage.candlesCount})</span>
                </button>

                <button
                  onClick={() => handleLeaveRose(activeMessage.id)}
                  className={`px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    reactedRoses[activeMessage.id] ? 'bg-rose-100 border-rose-300 text-rose-900' : 'border-stone-300 hover:bg-white'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>{reactedRoses[activeMessage.id] ? 'Rose Offered' : 'Leave a Rose'}</span>
                  <span className="tabular-nums font-mono">({activeMessage.rosesCount})</span>
                </button>
              </div>

              <button
                onClick={() => setActiveMessage(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Release a Lantern Modal */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-stone-900">
            <button
              onClick={() => setIsReleaseModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-sans tracking-wider uppercase text-amber-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-amber-700" />
                <span>Cast a Message to the Stars</span>
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-950">
                Release a Lantern of Love
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                Say what remains in your heart. Free, eternal, and held in gentle dignity.
              </p>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  To Whom Is This Message? <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="e.g. My Grandma Eleanor, or Michael, or My Childhood Companion"
                  required
                  className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs text-stone-900 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Connection or Reason
                </label>
                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="e.g. Departed in 2022, or separated by distance, or a silent parting"
                  className="w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2 text-xs text-stone-900 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Your Message of Love & Memory <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write freely. Express the gratitude, the laughter you shared, the forgiveness, or the love that outlives any silence..."
                  rows={5}
                  required
                  className="w-full bg-white border border-stone-300 rounded-lg p-3.5 text-sm text-stone-900 font-serif leading-relaxed focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Signature (optional)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Your daughter, or Alex"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Lantern Glow Tone
                  </label>
                  <select
                    value={lanternMood}
                    onChange={(e) => setLanternMood(e.target.value as 'amber' | 'rose' | 'starlight' | 'lavender')}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                  >
                    <option value="amber">Warm Amber</option>
                    <option value="rose">Rose Radiance</option>
                    <option value="starlight">Starlight White</option>
                    <option value="lavender">Lavender Dusk</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Release Lantern Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
