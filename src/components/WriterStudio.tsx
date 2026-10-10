import React, { useState, useEffect } from 'react';
import { Story, StoryGenre, VisibilityMode } from '../types';
import { IMAGES, getOrCreateAuthorToken, upsertStory } from '../utils/storage';
import { generateSecretLinkKey, encryptWithRawKey, encryptWithPassphrase } from '../utils/crypto';
import {
  Feather,
  Lock,
  Globe,
  KeyRound,
  Maximize2,
  Minimize2,
  Sparkles,
  Heart,
  Image as ImageIcon,
  Check,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Eye,
  Type
} from 'lucide-react';

interface WriterStudioProps {
  initialStory?: Story | null;
  initialPrompt?: string;
  initialGenre?: StoryGenre;
  onBack: () => void;
  onPublished: (story: Story, encryptionKey?: string) => void;
}

export const WriterStudio: React.FC<WriterStudioProps> = ({
  initialStory,
  initialPrompt,
  initialGenre = 'Essay',
  onBack,
  onPublished
}) => {
  const [title, setTitle] = useState(initialStory?.title || '');
  const [subtitle, setSubtitle] = useState(initialStory?.subtitle || '');
  const [content, setContent] = useState(
    initialStory?.content || (initialPrompt ? `> Inspiration: ${initialPrompt}\n\n` : '')
  );
  const [authorName, setAuthorName] = useState(initialStory?.authorName || 'Anonymous Quill');
  const [authorHandle, setAuthorHandle] = useState(initialStory?.authorHandle || '');
  const [genre, setGenre] = useState<StoryGenre>(initialStory?.genre || initialGenre);
  const [coverImage, setCoverImage] = useState<string>(initialStory?.coverImage || IMAGES.heroHaven);
  const [visibility, setVisibility] = useState<VisibilityMode>(initialStory?.visibility || 'public');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseHint, setPassphraseHint] = useState(initialStory?.passphraseHint || '');
  const [isMemoryDedication, setIsMemoryDedication] = useState(initialStory?.isMemoryCornerDedication || false);
  const [departedName, setDepartedName] = useState(initialStory?.departedName || '');
  const [departedRelation, setDepartedRelation] = useState(initialStory?.departedRelation || '');

  const [fontStyle, setFontStyle] = useState<'serif' | 'sans' | 'typewriter'>('serif');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedKey, setPublishedKey] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute stats
  const wordCount = content.trim().length ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const availableCovers = [
    { label: 'Writer Atelier', url: IMAGES.heroHaven },
    { label: 'Starlight Lanterns', url: IMAGES.memoryLanterns },
    { label: 'Mechanical Keys', url: IMAGES.editorialTypewriter },
    { label: 'None (Pure Parchment)', url: '' }
  ];

  // Insert markdown helper into textarea
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('studio-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 10);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content for your piece.');
      return;
    }

    if (visibility === 'passphrase' && !passphrase.trim() && !initialStory?.encryptedContent) {
      alert('Please enter a secret passphrase to lock this story.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authorToken = initialStory?.authorToken || getOrCreateAuthorToken();
      const storyId = initialStory?.id || 'story_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      let generatedKey: string | undefined = undefined;

      const storyData: Story = {
        id: storyId,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content,
        authorName: authorName.trim() || 'Anonymous Quill',
        authorHandle: authorHandle.trim() ? (authorHandle.startsWith('@') ? authorHandle : `@${authorHandle}`) : undefined,
        createdAt: initialStory?.createdAt || Date.now(),
        updatedAt: Date.now(),
        genre,
        coverImage: coverImage || undefined,
        readingTimeMinutes: readingTime,
        wordCount,
        visibility,
        rosesCount: initialStory?.rosesCount || 0,
        resonancesCount: initialStory?.resonancesCount || 0,
        authorToken,
        isMemoryCornerDedication: isMemoryDedication,
        departedName: isMemoryDedication ? departedName.trim() : undefined,
        departedRelation: isMemoryDedication ? departedRelation.trim() : undefined,
      };

      // Perform real client-side encryption based on visibility mode
      if (visibility === 'encrypted_link') {
        generatedKey = await generateSecretLinkKey();
        const { ciphertext, iv } = await encryptWithRawKey(content, generatedKey);
        storyData.isEncryptedPayload = true;
        storyData.encryptedContent = ciphertext;
        storyData.encryptionIv = iv;
        // Obfuscate plaintext stored copy so only key unlocks it
        storyData.content = '🔒 [This manuscript is encrypted with AES-256. Decryption key required.]';
      } else if (visibility === 'passphrase') {
        const { ciphertext, salt, iv } = await encryptWithPassphrase(content, passphrase);
        storyData.isEncryptedPayload = true;
        storyData.encryptedContent = ciphertext;
        storyData.encryptionSalt = salt;
        storyData.encryptionIv = iv;
        storyData.passphraseHint = passphraseHint.trim() || undefined;
        storyData.content = '🔒 [This manuscript is protected by a secret passphrase.]';
      } else {
        storyData.isEncryptedPayload = false;
        storyData.encryptedContent = undefined;
        storyData.encryptionIv = undefined;
        storyData.encryptionSalt = undefined;
      }

      // Upsert into storage
      upsertStory(storyData);

      // Create share link URL
      let url = `${window.location.origin}${window.location.pathname}#/read/${storyId}`;
      if (visibility === 'encrypted_link' && generatedKey) {
        url += `?key=${generatedKey}`;
        setPublishedKey(generatedKey);
      }
      setShareableUrl(url);

      onPublished(storyData, generatedKey);
    } catch (err) {
      console.error('Failed to publish story', err);
      alert('An error occurred while sealing your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className={`transition-all ${isZenMode ? 'fixed inset-0 z-50 bg-[#FAF8F5] overflow-y-auto p-6 sm:p-12' : 'max-w-5xl mx-auto px-6 py-10'}`}>
      
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200/80 mb-8">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Studio</span>
        </button>

        <div className="flex items-center gap-4 text-xs font-sans text-stone-500">
          <span className="tabular-nums font-mono">{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>{readingTime} min read</span>
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            type="button"
            className="flex items-center gap-1.5 p-1.5 px-3 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors ml-2 cursor-pointer"
            title="Toggle Distraction-Free Zen Mode"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isZenMode ? 'Exit Zen' : 'Zen Canvas'}</span>
          </button>
        </div>
      </div>

      {shareableUrl ? (
        /* Published Success & Secure Link Banner */
        <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-6 shadow-md max-w-2xl mx-auto">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <div>
              <h2 className="text-xl font-serif font-semibold text-stone-900">
                Manuscript Sealed & Published
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                {visibility === 'public'
                  ? 'Your story is live in the Discovery Feed.'
                  : visibility === 'encrypted_link'
                  ? 'Encrypted with AES-256. Accessible only to whoever holds this secure link.'
                  : 'Passphrase-locked. Readers must supply the secret code to open.'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              {visibility === 'encrypted_link' ? 'Encrypted One-Click Link' : 'Your Story Link'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full text-xs font-mono bg-white border border-stone-300 rounded px-3 py-2 text-stone-800 select-all"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {visibility === 'passphrase' && (
            <div className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200 rounded-lg p-3">
              Remember to share your secret passphrase with your readers so they can decrypt your words.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={onBack}
              className="px-5 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 border border-stone-300 rounded-lg cursor-pointer"
            >
              Back to Feed
            </button>
            <a
              href={shareableUrl}
              className="px-5 py-2 text-xs font-medium bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Read Manuscript Now</span>
            </a>
          </div>
        </div>
      ) : (
        /* Writing Canvas */
        <form onSubmit={handlePublish} className="space-y-8">
          
          {/* Cover & Genre Selector */}
          {!isZenMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-100/70 p-5 rounded-2xl border border-stone-200/90 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Chronicle Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as StoryGenre)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 text-xs focus:ring-1 focus:ring-stone-800"
                >
                  <option value="Essay">Essay</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Memoir">Memoir</option>
                  <option value="Letter">Unsent Letter</option>
                  <option value="Short Story">Short Story</option>
                  <option value="Philosophy">Life Philosophy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Author Signature
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your pen name"
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 text-xs focus:ring-1 focus:ring-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Cover Artwork
                </label>
                <select
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 text-xs focus:ring-1 focus:ring-stone-800"
                >
                  {availableCovers.map(c => (
                    <option key={c.label} value={c.url}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Title and Subtitle inputs */}
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your chronicle..."
              required
              className="w-full text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 placeholder:text-stone-300 bg-transparent border-0 border-b border-stone-200 focus:border-stone-800 focus:ring-0 px-0 pb-3 font-semibold transition-colors outline-none"
            />

            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A quiet subtitle or thesis (optional)..."
              className="w-full text-base sm:text-lg font-sans text-stone-600 placeholder:text-stone-300 bg-transparent border-0 focus:ring-0 px-0 py-1 transition-colors outline-none"
            />
          </div>

          {/* Formatting & Typography Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-y border-stone-200/90 text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-800 font-bold cursor-pointer"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-800 italic cursor-pointer"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-800 cursor-pointer"
                title="Quote Block"
              >
                "Quote"
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-800 cursor-pointer"
                title="Section Header"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n\n* * *\n\n')}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-800 cursor-pointer"
                title="Divider"
              >
                * * *
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">Canvas Font:</span>
              <button
                type="button"
                onClick={() => setFontStyle('serif')}
                className={`px-2.5 py-1 rounded cursor-pointer ${fontStyle === 'serif' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                Serif
              </button>
              <button
                type="button"
                onClick={() => setFontStyle('sans')}
                className={`px-2.5 py-1 rounded cursor-pointer ${fontStyle === 'sans' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => setFontStyle('typewriter')}
                className={`px-2.5 py-1 rounded cursor-pointer font-mono ${fontStyle === 'typewriter' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                Typewriter
              </button>
            </div>
          </div>

          {/* The Main Writing Textarea */}
          <div className="relative">
            <textarea
              id="studio-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Let your words breathe freely here. Write as if no judge existed, only a listening world or a trusted keeper..."
              rows={16}
              required
              className={`w-full bg-white/70 border border-stone-200/90 rounded-2xl p-6 sm:p-8 text-stone-900 leading-relaxed text-base sm:text-lg focus:ring-1 focus:ring-amber-500/50 focus:border-stone-400 outline-none transition-all resize-y shadow-inner ${
                fontStyle === 'serif' ? 'font-serif text-xl' : fontStyle === 'typewriter' ? 'font-mono text-sm' : 'font-sans'
              }`}
            />
          </div>

          {/* Granular Visibility & Encryption Settings */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-serif font-semibold text-stone-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Visibility & Encryption Settings</span>
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Decide who gets to read your words and whether they are sealed with client-side cryptography.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option 1: Public */}
              <label
                onClick={() => setVisibility('public')}
                className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  visibility === 'public'
                    ? 'border-stone-900 bg-stone-50 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Public Chronicle</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-normal">
                    Visible on the Discovery Feed for all visitors. Free and accessible to everyone.
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-stone-600">
                  {visibility === 'public' ? '● Selected' : '○ Select'}
                </div>
              </label>

              {/* Option 2: Encrypted Secret Link */}
              <label
                onClick={() => setVisibility('encrypted_link')}
                className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  visibility === 'encrypted_link'
                    ? 'border-stone-900 bg-amber-50/50 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <KeyRound className="w-4 h-4 text-amber-700" />
                    <span>Encrypted Link Only</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-normal">
                    Sealed with AES-256. Accessible ONLY via the unique cryptographic link key. Not listed in public feeds.
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-stone-600">
                  {visibility === 'encrypted_link' ? '● Selected' : '○ Select'}
                </div>
              </label>

              {/* Option 3: Passphrase-Protected */}
              <label
                onClick={() => setVisibility('passphrase')}
                className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  visibility === 'passphrase'
                    ? 'border-stone-900 bg-stone-50 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <Lock className="w-4 h-4 text-rose-700" />
                    <span>Passphrase-Locked</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-normal">
                    Requires a custom password to unlock and read. Ideal for intimate memoirs, diary entries, or close circles.
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-stone-600">
                  {visibility === 'passphrase' ? '● Selected' : '○ Select'}
                </div>
              </label>
            </div>

            {/* If Passphrase is selected */}
            {visibility === 'passphrase' && (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Secret Passphrase <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="e.g. moonlight-whisper-2026"
                      required={visibility === 'passphrase'}
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:ring-1 focus:ring-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Password Hint (optional)
                    </label>
                    <input
                      type="text"
                      value={passphraseHint}
                      onChange={(e) => setPassphraseHint(e.target.value)}
                      placeholder="e.g. Our favourite coffee spot in summer"
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:ring-1 focus:ring-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Memory Corner Dedication Toggle */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMemoryDedication}
                  onChange={(e) => setIsMemoryDedication(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <span className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Dedicate this piece to someone no longer in your life (Memory Corner)</span>
                </span>
              </label>

              {isMemoryDedication && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      To Whom (Name or initials)
                    </label>
                    <input
                      type="text"
                      value={departedName}
                      onChange={(e) => setDepartedName(e.target.value)}
                      placeholder="e.g. My Grandma Eleanor, or S."
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Relationship or Context
                    </label>
                    <input
                      type="text"
                      value={departedRelation}
                      onChange={(e) => setDepartedRelation(e.target.value)}
                      placeholder="e.g. Departed 2021, or separated by distance"
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Feather className="w-4 h-4" />
              <span>{isSubmitting ? 'Sealing Words...' : 'Seal & Publish Manuscript'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
