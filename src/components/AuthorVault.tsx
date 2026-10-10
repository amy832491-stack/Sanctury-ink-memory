import React, { useState } from 'react';
import { Story, VisibilityMode } from '../types';
import { getOrCreateAuthorToken, upsertStory, deleteStory, getStories } from '../utils/storage';
import { generateSecretLinkKey, encryptWithRawKey } from '../utils/crypto';
import {
  Lock,
  Globe,
  KeyRound,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Check,
  Feather,
  Heart,
  Share2,
  Download,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface AuthorVaultProps {
  onSelectStory: (id: string) => void;
  onEditStory: (story: Story) => void;
  onOpenNewStory: () => void;
  onRefreshStories: () => void;
}

export const AuthorVault: React.FC<AuthorVaultProps> = ({
  onSelectStory,
  onEditStory,
  onOpenNewStory,
  onRefreshStories
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const myToken = getOrCreateAuthorToken();
  const allStories = getStories();
  const myStories = allStories.filter((s) => s.authorToken === myToken || s.authorToken === 'editorial_curator');

  const handleCopyStoryLink = (story: Story) => {
    let url = `${window.location.origin}${window.location.pathname}#/read/${story.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleVisibility = async (story: Story, newMode: VisibilityMode) => {
    let updated = { ...story, visibility: newMode };

    if (newMode === 'encrypted_link' && !story.isEncryptedPayload) {
      const newKey = await generateSecretLinkKey();
      const { ciphertext, iv } = await encryptWithRawKey(story.content, newKey);
      updated.isEncryptedPayload = true;
      updated.encryptedContent = ciphertext;
      updated.encryptionIv = iv;
      updated.content = '🔒 [This manuscript is encrypted with AES-256. Decryption key required.]';
    } else if (newMode === 'public' && story.isEncryptedPayload) {
      // If switching back to public, preserve text
      // if already decrypted or store
    }

    upsertStory(updated);
    onRefreshStories();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this manuscript from your vault?')) {
      deleteStory(id);
      onRefreshStories();
    }
  };

  const exportAllToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(myStories, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `sanctuary_manuscripts_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs uppercase tracking-widest text-stone-500 font-sans">
            Author Chamber & Encryption Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-1">
            My Manuscripts
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Manage public broadcasts, encrypted zero-knowledge share links, and passphrase locks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportAllToJSON}
            className="px-4 py-2 text-xs font-medium border border-stone-300 hover:border-stone-400 bg-white rounded-lg text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export all written manuscripts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={onOpenNewStory}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-medium shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>New Manuscript</span>
          </button>
        </div>
      </div>

      {/* Stories list */}
      <div className="space-y-6">
        {myStories.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
            <Feather className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-xl font-serif font-semibold text-stone-800">Your Vault is Empty</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Write your first essay, poem, or encrypted secret letter. You have complete control over visibility.
            </p>
            <button
              onClick={onOpenNewStory}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-all cursor-pointer"
            >
              Start Writing Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myStories.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-stone-200 rounded-xl p-6 transition-all hover:border-stone-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  {/* Clean unboxed metadata (strict zero-pill rule) */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                    <span className="font-semibold text-stone-700">{story.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{story.wordCount} words</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.readingTimeMinutes} min read</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <h3
                    onClick={() => onSelectStory(story.id)}
                    className="text-xl font-serif font-bold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    {story.title}
                  </h3>

                  {story.subtitle && (
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {story.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
                    <span className="flex items-center gap-1 text-rose-600">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                      <span className="tabular-nums">{story.rosesCount} roses</span>
                    </span>
                    {story.isMemoryCornerDedication && (
                      <span className="text-amber-700 flex items-center gap-1 font-serif">
                        <Sparkles className="w-3 h-3" />
                        <span>Dedicated in Memory Corner</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Visibility Controls and Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  
                  {/* Visibility Dropdown Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-400">Visibility:</span>
                    <select
                      value={story.visibility}
                      onChange={(e) => handleToggleVisibility(story, e.target.value as VisibilityMode)}
                      className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium cursor-pointer"
                    >
                      <option value="public">Public</option>
                      <option value="encrypted_link">Encrypted Link</option>
                      <option value="passphrase">Passphrase-Locked</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyStoryLink(story)}
                      className="p-2 border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedId === story.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onSelectStory(story.id)}
                      className="p-2 border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors cursor-pointer"
                      title="Read Story"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditStory(story)}
                      className="p-2 border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors cursor-pointer"
                      title="Edit Story"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(story.id)}
                      className="p-2 border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
