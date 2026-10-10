/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { DiscoverFeed } from './components/DiscoverFeed';
import { WriterStudio } from './components/WriterStudio';
import { StoryReader } from './components/StoryReader';
import { MemoryCorner } from './components/MemoryCorner';
import { AuthorVault } from './components/AuthorVault';
import { Story, StoryGenre, MemoryMessage, ReadingGoal } from './types';
import { getStories, getMemoryMessages, getStoryById, getOrCreateAuthorToken, getReadingGoal } from './utils/storage';
import { Feather, Heart, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'discover' | 'memories' | 'studio' | 'vault'>('discover');
  const [stories, setStories] = useState<Story[]>([]);
  const [memories, setMemories] = useState<MemoryMessage[]>([]);
  const [readingGoal, setReadingGoal] = useState<ReadingGoal>(getReadingGoal());
  
  // Active reading story & key
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeUrlKey, setActiveUrlKey] = useState<string | null>(null);

  // Active editing story in Studio
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [initialPromptForStudio, setInitialPromptForStudio] = useState<string | undefined>(undefined);
  const [initialGenreForStudio, setInitialGenreForStudio] = useState<StoryGenre | undefined>(undefined);

  // Refresh data
  const refreshAll = () => {
    setStories(getStories());
    setMemories(getMemoryMessages());
    setReadingGoal(getReadingGoal());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Parse Hash Route
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/read/')) {
        const withoutPrefix = hash.replace('#/read/', '');
        const [id, searchParams] = withoutPrefix.split('?');
        setActiveStoryId(id);
        if (searchParams) {
          const params = new URLSearchParams(searchParams);
          setActiveUrlKey(params.get('key'));
        } else {
          setActiveUrlKey(null);
        }
      } else if (hash === '#/memories') {
        setActiveStoryId(null);
        setCurrentTab('memories');
      } else if (hash === '#/vault') {
        setActiveStoryId(null);
        setCurrentTab('vault');
      } else if (hash === '#/studio') {
        setActiveStoryId(null);
        setCurrentTab('studio');
      } else {
        setActiveStoryId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle Navigation
  const handleNavigate = (tab: 'discover' | 'memories' | 'studio' | 'vault') => {
    setActiveStoryId(null);
    setCurrentTab(tab);
    if (tab === 'discover') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${tab}`;
    }
  };

  // Open Story Reader
  const handleSelectStory = (storyId: string, secretKey?: string) => {
    setActiveStoryId(storyId);
    if (secretKey) {
      window.location.hash = `#/read/${storyId}?key=${secretKey}`;
    } else {
      window.location.hash = `#/read/${storyId}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Studio for a brand new story or with a prompt
  const handleOpenNewStory = (initialPrompt?: string, genre?: StoryGenre) => {
    setEditingStory(null);
    setInitialPromptForStudio(initialPrompt);
    setInitialGenreForStudio(genre);
    setActiveStoryId(null);
    setCurrentTab('studio');
    window.location.hash = '#/studio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Edit existing story
  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setInitialPromptForStudio(undefined);
    setInitialGenreForStudio(undefined);
    setActiveStoryId(null);
    setCurrentTab('studio');
    window.location.hash = '#/studio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // On Published
  const handleStoryPublished = (publishedStory: Story, encryptionKey?: string) => {
    refreshAll();
    // Keep in reader or return
  };

  const myToken = getOrCreateAuthorToken();
  const myStories = stories.filter((s) => s.authorToken === myToken || s.authorToken === 'editorial_curator');

  // Currently selected story for reading
  const activeStory = activeStoryId ? getStoryById(activeStoryId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 paper-texture selection:bg-amber-200 selection:text-stone-900">
      
      {/* 1. Universal Top Navigation Bar (Strict Top Bar Contract) */}
      <TopNavigation
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenNewStory={() => handleOpenNewStory()}
        myDraftsCount={myStories.length}
      />

      {/* 2. Main View Routing */}
      <main className="flex-1">
        {activeStory ? (
          /* Story Reader View */
          <StoryReader
            story={activeStory}
            urlKey={activeUrlKey}
            onBack={() => {
              setActiveStoryId(null);
              window.location.hash = '';
            }}
            onEditStory={handleEditStory}
            onDeleted={() => {
              setActiveStoryId(null);
              refreshAll();
              window.location.hash = '';
            }}
            onStoryFinishedReading={() => {
              setReadingGoal(getReadingGoal());
            }}
          />
        ) : currentTab === 'studio' ? (
          /* Writer's Studio Canvas */
          <WriterStudio
            initialStory={editingStory}
            initialPrompt={initialPromptForStudio}
            initialGenre={initialGenreForStudio}
            onBack={() => handleNavigate('discover')}
            onPublished={handleStoryPublished}
          />
        ) : currentTab === 'memories' ? (
          /* The Memory Corner */
          <MemoryCorner
            memories={memories}
            onBackToFeed={() => handleNavigate('discover')}
            onRefreshMemories={refreshAll}
          />
        ) : currentTab === 'vault' ? (
          /* Author Vault & Visibility Management */
          <AuthorVault
            onSelectStory={(id) => handleSelectStory(id)}
            onEditStory={handleEditStory}
            onOpenNewStory={() => handleOpenNewStory()}
            onRefreshStories={refreshAll}
          />
        ) : (
          /* Default: Discover Feed */
          <DiscoverFeed
            stories={stories}
            readingGoal={readingGoal}
            onGoalUpdated={(updated) => setReadingGoal(updated)}
            onSelectStory={(id) => handleSelectStory(id)}
            onOpenNewStory={handleOpenNewStory}
            onNavigateToMemories={() => handleNavigate('memories')}
          />
        )}
      </main>

      {/* 3. Footer (Anti-Slop: clean, quiet, and meaningful) */}
      <footer className="border-t border-stone-200/80 bg-stone-100/60 py-12 px-6 lg:px-12 mt-20 text-stone-600 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-serif font-bold text-stone-900 text-base">Sanctuary</span>
            <p className="text-stone-500">
              Free forever for writers, poets, and unspoken memories. Client-side zero-knowledge encryption.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-stone-500">
            <button
              onClick={() => handleNavigate('discover')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Discover
            </button>
            <button
              onClick={() => handleNavigate('memories')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              Memory Corner
            </button>
            <button
              onClick={() => handleNavigate('vault')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              My Vault
            </button>
            <button
              onClick={() => handleOpenNewStory()}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              Write Free
            </button>
          </div>

          <div className="text-stone-400 text-center md:text-right">
            <span>© {new Date().getFullYear()} Sanctuary Ink & Solace. Dedicated to all who write and remember.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
