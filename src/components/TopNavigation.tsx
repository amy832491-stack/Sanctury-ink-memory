import React, { useState, useEffect } from 'react';
import { PenTool, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { ambientSoundscape } from '../utils/ambientAudio';

interface TopNavigationProps {
  currentTab: 'discover' | 'memories' | 'studio' | 'vault';
  onNavigate: (tab: 'discover' | 'memories' | 'studio' | 'vault') => void;
  onOpenNewStory: () => void;
  myDraftsCount: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onNavigate,
  onOpenNewStory,
  myDraftsCount
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    setIsAudioPlaying(ambientSoundscape.getIsPlaying());
  }, []);

  const handleToggleAudio = () => {
    const playing = ambientSoundscape.toggle();
    setIsAudioPlaying(playing);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark in display face */}
        <button
          onClick={() => onNavigate('discover')}
          className="text-2xl lg:text-3xl font-serif tracking-tight text-stone-900 font-semibold hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-2"
        >
          <span>Sanctuary</span>
          <span className="hidden sm:inline text-xs font-sans tracking-widest uppercase text-stone-400 font-normal">Ink & Memory</span>
        </button>

        {/* Zone 2: 4 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('discover')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'discover'
                ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            Discover Feed
          </button>

          <button
            onClick={() => onNavigate('memories')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'memories'
                ? 'text-stone-950 font-semibold border-b-2 border-amber-700'
                : 'hover:text-amber-900'
            }`}
          >
            <span>The Memory Corner</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" title="Sanctuary for departed loves" />
          </button>

          <button
            onClick={() => onNavigate('vault')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'vault'
                ? 'text-stone-950 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            My Manuscripts {myDraftsCount > 0 ? `(${myDraftsCount})` : ''}
          </button>
        </nav>

        {/* Zone 3: 1 primary action (+ quiet audio ambience toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleAudio}
            type="button"
            className={`p-2.5 rounded-full transition-all border ${
              isAudioPlaying
                ? 'bg-amber-100/80 border-amber-300 text-amber-800 shadow-sm'
                : 'bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
            }`}
            title={isAudioPlaying ? 'Mute soothing ambience' : 'Play peaceful writing soundscape'}
            aria-label="Toggle ambient writing audio"
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenNewStory}
            className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write a Story</span>
          </button>
        </div>

      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 py-2.5 px-4 bg-stone-50 text-xs font-medium text-stone-600">
        <button
          onClick={() => onNavigate('discover')}
          className={`py-1 px-2 ${currentTab === 'discover' ? 'text-stone-950 font-semibold' : ''}`}
        >
          Discover
        </button>
        <button
          onClick={() => onNavigate('memories')}
          className={`py-1 px-2 ${currentTab === 'memories' ? 'text-amber-800 font-semibold' : ''}`}
        >
          Memory Corner
        </button>
        <button
          onClick={() => onNavigate('vault')}
          className={`py-1 px-2 ${currentTab === 'vault' ? 'text-stone-950 font-semibold' : ''}`}
        >
          My Vault
        </button>
      </div>
    </header>
  );
};
