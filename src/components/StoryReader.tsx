import React, { useState, useEffect } from 'react';
import { Story, VisibilityMode } from '../types';
import { decryptWithRawKey, decryptWithPassphrase, generateSecretLinkKey, encryptWithRawKey } from '../utils/crypto';
import { reactToStory, upsertStory, deleteStory, getOrCreateAuthorToken, recordStoryRead, getReadingGoal } from '../utils/storage';
import {
  ArrowLeft,
  Heart,
  Share2,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Check,
  Copy,
  Settings,
  Sparkles,
  Download,
  Eye,
  Trash2,
  Edit3,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

interface StoryReaderProps {
  story: Story;
  urlKey?: string | null;
  onBack: () => void;
  onEditStory: (story: Story) => void;
  onDeleted: () => void;
  onStoryFinishedReading?: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  urlKey,
  onBack,
  onEditStory,
  onDeleted,
  onStoryFinishedReading
}) => {
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [hasLoggedReading, setHasLoggedReading] = useState(false);

  // Reader Customization
  const [readerTheme, setReaderTheme] = useState<'paper' | 'sepia' | 'midnight'>('paper');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readerFont, setReaderFont] = useState<'serif' | 'sans'>('serif');

  // Reactions
  const [roses, setRoses] = useState(story.rosesCount || 0);
  const [hasGivenRose, setHasGivenRose] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthorSettings, setShowAuthorSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Author visibility update state
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityMode>(story.visibility);
  const [currentSecretKey, setCurrentSecretKey] = useState<string | null>(urlKey || null);

  const myAuthorToken = getOrCreateAuthorToken();
  const isAuthor = story.authorToken === myAuthorToken;

  // Check if story is already logged in today's reading goal
  useEffect(() => {
    const goal = getReadingGoal();
    if (goal.readStoryIdsToday.includes(story.id)) {
      setHasLoggedReading(true);
    }
  }, [story.id]);

  // Handle Mark as Read for Daily Goal Tracker
  const handleMarkAsRead = () => {
    recordStoryRead(story.id, story.wordCount);
    setHasLoggedReading(true);
    if (onStoryFinishedReading) {
      onStoryFinishedReading();
    }
  };

  // Auto-decrypt if encrypted_link and key is provided in URL
  useEffect(() => {
    if (story.isEncryptedPayload && story.encryptedContent) {
      if (story.visibility === 'encrypted_link' && urlKey && story.encryptionIv) {
        setIsDecrypting(true);
        decryptWithRawKey(story.encryptedContent, story.encryptionIv, urlKey)
          .then((text) => {
            setDecryptedText(text);
            setDecryptError(null);
          })
          .catch((err) => {
            console.error('Decryption failed', err);
            setDecryptError('The decryption key in your link is invalid or corrupted.');
          })
          .finally(() => setIsDecrypting(false));
      }
    } else {
      setDecryptedText(story.content);
    }
  }, [story, urlKey]);

  const handleUnlockWithPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphraseInput.trim() || !story.encryptedContent || !story.encryptionSalt || !story.encryptionIv) return;

    setIsDecrypting(true);
    setDecryptError(null);
    try {
      const text = await decryptWithPassphrase(
        story.encryptedContent,
        passphraseInput,
        story.encryptionSalt,
        story.encryptionIv
      );
      setDecryptedText(text);
      setDecryptError(null);
    } catch {
      setDecryptError('Incorrect passphrase. Please check capitalization and try again.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleGiveRose = () => {
    if (hasGivenRose) return;
    setRoses((prev) => prev + 1);
    setHasGivenRose(true);
    reactToStory(story.id, 'rose');
  };

  const getShareUrl = () => {
    let url = `${window.location.origin}${window.location.pathname}#/read/${story.id}`;
    if (story.visibility === 'encrypted_link' && currentSecretKey) {
      url += `?key=${currentSecretKey}`;
    }
    return url;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveVisibilityChange = async () => {
    let updatedStory = { ...story, visibility: selectedVisibility };

    if (selectedVisibility === 'encrypted_link' && !currentSecretKey && decryptedText) {
      const newKey = await generateSecretLinkKey();
      const { ciphertext, iv } = await encryptWithRawKey(decryptedText, newKey);
      updatedStory.isEncryptedPayload = true;
      updatedStory.encryptedContent = ciphertext;
      updatedStory.encryptionIv = iv;
      updatedStory.content = '🔒 [This manuscript is encrypted with AES-256. Decryption key required.]';
      setCurrentSecretKey(newKey);
    } else if (selectedVisibility === 'public' && decryptedText) {
      updatedStory.isEncryptedPayload = false;
      updatedStory.content = decryptedText;
      updatedStory.encryptedContent = undefined;
    }

    upsertStory(updatedStory);
    setShowAuthorSettings(false);
    alert('Visibility settings updated successfully.');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this manuscript?')) {
      deleteStory(story.id);
      onDeleted();
    }
  };

  const themeClasses = {
    paper: 'bg-[#FAF8F5] text-stone-900',
    sepia: 'bg-[#F4EFE6] text-stone-900',
    midnight: 'bg-[#141210] text-stone-200 selection:bg-amber-800'
  }[readerTheme];

  const fontSizeClasses = {
    normal: 'text-lg sm:text-xl leading-relaxed sm:leading-loose',
    large: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
    xlarge: 'text-2xl sm:text-3xl leading-relaxed sm:leading-loose'
  }[fontSize];

  return (
    <div className={`min-h-screen py-10 transition-colors duration-300 ${themeClasses}`}>
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-300/40 mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Chronicles</span>
          </button>

          {/* Reader Preferences Bar */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            {/* Theme selector */}
            <div className="flex items-center gap-1 p-0.5 bg-stone-300/30 rounded-lg">
              <button
                onClick={() => setReaderTheme('paper')}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${readerTheme === 'paper' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'opacity-70'}`}
                title="Paper White"
              >
                Paper
              </button>
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${readerTheme === 'sepia' ? 'bg-[#FAF6EC] text-amber-950 shadow-xs font-semibold' : 'opacity-70'}`}
                title="Warm Sepia"
              >
                Sepia
              </button>
              <button
                onClick={() => setReaderTheme('midnight')}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${readerTheme === 'midnight' ? 'bg-stone-800 text-stone-100 shadow-xs font-semibold' : 'opacity-70'}`}
                title="Midnight"
              >
                Night
              </button>
            </div>

            {/* Font size selector */}
            <div className="flex items-center gap-1 p-0.5 bg-stone-300/30 rounded-lg">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${fontSize === 'normal' ? 'bg-white dark:bg-stone-800 font-semibold shadow-xs' : 'opacity-70'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${fontSize === 'large' ? 'bg-white dark:bg-stone-800 font-semibold shadow-xs' : 'opacity-70'}`}
              >
                A+
              </button>
            </div>

            {/* Share link button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300/50 hover:bg-stone-200/40 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Author Management Button */}
            {isAuthor && (
              <button
                onClick={() => setShowAuthorSettings(!showAuthorSettings)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-stone-900 font-medium hover:bg-amber-300 transition-colors cursor-pointer"
                title="Manage visibility & settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Author Controls</span>
              </button>
            )}
          </div>
        </div>

        {/* Author Settings Panel (if toggled) */}
        {isAuthor && showAuthorSettings && (
          <div className="mb-10 p-6 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-2xl space-y-5 text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-semibold text-lg flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-600" />
                <span>Author Manuscript Management</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditStory(story)}
                  className="px-3 py-1 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit in Studio</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold tracking-wider uppercase text-stone-500">
                Update Visibility Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVisibility('public')}
                  className={`p-3 rounded-xl border text-left text-xs space-y-1 cursor-pointer ${selectedVisibility === 'public' ? 'border-amber-600 bg-amber-500/10 font-medium' : 'border-stone-200 dark:border-stone-800'}`}
                >
                  <div className="font-semibold">Public Chronicle</div>
                  <div className="text-stone-500">Listed on Discovery feed</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVisibility('encrypted_link')}
                  className={`p-3 rounded-xl border text-left text-xs space-y-1 cursor-pointer ${selectedVisibility === 'encrypted_link' ? 'border-amber-600 bg-amber-500/10 font-medium' : 'border-stone-200 dark:border-stone-800'}`}
                >
                  <div className="font-semibold">Encrypted Link Only</div>
                  <div className="text-stone-500">Zero-knowledge AES-256</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVisibility('passphrase')}
                  className={`p-3 rounded-xl border text-left text-xs space-y-1 cursor-pointer ${selectedVisibility === 'passphrase' ? 'border-amber-600 bg-amber-500/10 font-medium' : 'border-stone-200 dark:border-stone-800'}`}
                >
                  <div className="font-semibold">Passphrase-Locked</div>
                  <div className="text-stone-500">Requires password entry</div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowAuthorSettings(false)}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVisibilityChange}
                className="px-5 py-2 text-xs font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:opacity-90 cursor-pointer"
              >
                Save Visibility Settings
              </button>
            </div>
          </div>
        )}

        {/* Encrypted Status Banner */}
        {story.visibility === 'encrypted_link' && decryptedText && (
          <div className="mb-8 p-3.5 bg-amber-500/10 border border-amber-600/30 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Decrypted with zero-knowledge AES-256 key from secure link.</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="text-xs font-medium underline hover:text-amber-700 cursor-pointer"
            >
              Copy Encrypted Link
            </button>
          </div>
        )}

        {/* Memory Corner Tribute Banner */}
        {story.isMemoryCornerDedication && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-400/30 rounded-xl flex items-center gap-3 text-rose-900 dark:text-rose-200">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold">Memory Corner Dedication: </span>
              <span>Dedicated to {story.departedName || 'a departed soul'} ({story.departedRelation || 'loved and remembered'}).</span>
            </div>
          </div>
        )}

        {/* Story Header */}
        <header className="space-y-4 mb-10 text-center sm:text-left">
          {/* Metadata clean unboxed text with typographic separator (strict zero-pill rule) */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs opacity-60 font-sans tracking-wide">
            <span>{story.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{story.readingTimeMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{story.wordCount} words</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.15] text-balance">
            {story.title}
          </h1>

          {story.subtitle && (
            <p className="text-lg sm:text-2xl font-serif italic opacity-75 font-normal">
              {story.subtitle}
            </p>
          )}

          <div className="pt-3 flex items-center justify-center sm:justify-start gap-3 text-sm">
            <span className="font-medium">{story.authorName}</span>
            {story.authorHandle && (
              <span className="opacity-50 text-xs">{story.authorHandle}</span>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {story.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-stone-200/60 dark:border-stone-800 shadow-md">
            <img
              src={story.coverImage}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content Area or Lock Screen */}
        {decryptedText ? (
          /* Plain or Decrypted Content */
          <article className={`space-y-6 ${fontSizeClasses} ${readerFont === 'serif' ? 'font-serif' : 'font-sans'}`}>
            {decryptedText.split('\n\n').map((paragraph, idx) => {
              // Quote block
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="p-5 my-6 border-l-2 border-amber-600/60 italic opacity-85 text-lg bg-stone-500/5 rounded-r-xl"
                  >
                    {paragraph.replace(/^>\s*/, '')}
                  </blockquote>
                );
              }
              // Divider
              if (paragraph.trim() === '* * *' || paragraph.trim() === '---') {
                return (
                  <div key={idx} className="py-8 text-center tracking-widest text-lg opacity-40">
                    * * *
                  </div>
                );
              }
              // Heading
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-2xl sm:text-3xl font-serif font-semibold mt-10 mb-4 opacity-95">
                    {paragraph.replace(/^##\s*/, '')}
                  </h2>
                );
              }
              // First paragraph drop cap
              return (
                <p
                  key={idx}
                  className={`leading-relaxed ${idx === 0 ? 'drop-cap' : ''}`}
                >
                  {paragraph}
                </p>
              );
            })}
          </article>
        ) : (
          /* Sealed / Locked State */
          <div className="my-16 max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100">
                Sealed Manuscript
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed">
                {story.visibility === 'encrypted_link'
                  ? 'This story is encrypted with AES-256. You need the complete link with the decryption key to read it.'
                  : 'This story is sealed by the author with a secret passphrase.'}
              </p>
            </div>

            {story.visibility === 'passphrase' ? (
              <form onSubmit={handleUnlockWithPassphrase} className="space-y-4 text-left">
                {story.passphraseHint && (
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg text-xs text-stone-600 dark:text-stone-300">
                    <span className="font-semibold">Author's Hint: </span>
                    <span>{story.passphraseHint}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Enter Passphrase
                  </label>
                  <input
                    type="password"
                    value={passphraseInput}
                    onChange={(e) => setPassphraseInput(e.target.value)}
                    placeholder="Type the secret password..."
                    required
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                {decryptError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {decryptError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isDecrypting}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-medium rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isDecrypting ? 'Unlocking...' : 'Unlock & Read Words'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-stone-500">
                  Please ask the author for their complete encrypted link containing the decryption key.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reading Goal Progress Banner & Completion */}
        {decryptedText && (
          <div className="mt-12 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100 block sm:inline mr-2">
                  Daily Reading Goal
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  This chronicle contains {story.wordCount} words (~{story.readingTimeMinutes} min read).
                </span>
              </div>
            </div>

            <button
              onClick={handleMarkAsRead}
              disabled={hasLoggedReading}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                hasLoggedReading
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 shadow-xs'
              }`}
            >
              {hasLoggedReading ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Finished & Logged (+{story.wordCount} words)</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Finished & Add to Goal</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Reader Resonance & Appreciation Footer */}
        {decryptedText && (
          <div className="mt-8 pt-8 border-t border-stone-300/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-semibold text-lg">Did these words touch you?</h4>
              <p className="text-xs opacity-60">Leave a rose for the author to honor their expression.</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleGiveRose}
                disabled={hasGivenRose}
                className={`px-5 py-2.5 rounded-full border flex items-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                  hasGivenRose
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                    : 'border-stone-300/80 hover:border-rose-400 hover:bg-rose-50/50 hover:text-rose-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasGivenRose ? 'fill-rose-600 text-rose-600' : 'text-rose-500'}`} />
                <span>{hasGivenRose ? 'Rose Offered' : 'Offer a Rose'}</span>
                <span className="tabular-nums opacity-75 font-mono text-xs">({roses})</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-5 py-2.5 rounded-full border border-stone-300/80 hover:bg-stone-200/30 flex items-center gap-2 text-sm font-medium transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Piece</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-semibold text-xl">Share This Chronicle</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {story.visibility === 'encrypted_link'
                    ? 'Encrypted link with embedded decryption key'
                    : 'Accessible freely to anyone with the link'}
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                Direct Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="w-full text-xs font-mono bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-3 py-2 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 space-y-2">
              <div className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quote Snippet for Socials</span>
              </div>
              <p className="text-sm font-serif italic text-stone-800 dark:text-stone-200">
                "{story.title} — by {story.authorName}"
              </p>
              <p className="text-xs text-stone-500">
                Free to read at Sanctuary.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
