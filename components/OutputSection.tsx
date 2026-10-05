import React, { useState } from 'react';
import { SeoOutputData } from '../types';
import { Copy, Check, FileText, Tag, Image as ImageIcon, Type, Settings, Hash, FolderTree, Sparkles } from 'lucide-react';

interface OutputSectionProps {
  data: SeoOutputData | null;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  onSaveProject?: () => void;
  isSavingProject?: boolean;
  isSavedProject?: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({
  data,
  onGenerateImage,
  isGeneratingImage,
  onSaveProject,
  isSavingProject,
  isSavedProject,
}) => {
  if (!data) return null;

  const titles = Array.isArray(data.titles) ? data.titles : [];
  const descriptions = Array.isArray(data.descriptions) ? data.descriptions : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const tagsString = tags.join(', ');
  const tagsCount = tagsString.length;

  // Extract or build hashtags list safely
  const hashtagsList = data.hashtags && Array.isArray(data.hashtags) && data.hashtags.length > 0
    ? data.hashtags.map((h) => (h && h.startsWith('#') ? h : `#${h}`))
    : tags.slice(0, 6).map((t) => `#${t.replace(/\s+/g, '')}`);

  const hashtagsString = hashtagsList.join(' ');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Category & Grounding Banner */}
      <div className="bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-purple-500/10 border border-primary-200 dark:border-primary-800/40 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-primary-600 text-white rounded-lg shadow-sm">
            <FolderTree className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
              Target YouTube Category
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {data.category || 'General'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {data.isGrounded && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800/50">
              <Sparkles className="w-3.5 h-3.5" /> Google Search Grounded
            </span>
          )}

          {onSaveProject && (
            <button
              onClick={onSaveProject}
              disabled={isSavingProject || isSavedProject}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all ${
                isSavedProject
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95'
              }`}
            >
              {isSavedProject ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved to Firebase
                </>
              ) : isSavingProject ? (
                'Saving...'
              ) : (
                'Save Project to Firebase'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Viral Titles */}
      <ResultCard title="Viral Titles (CTR Optimized)" icon={<Type className="text-blue-500 dark:text-blue-400" />}>
        <div className="space-y-3">
          {titles.map((title, idx) => (
            <CopyableItem key={idx} text={title} />
          ))}
        </div>
      </ResultCard>

      {/* Structured SEO Descriptions with Integrated Hashtags */}
      <ResultCard
        title="Structured SEO Descriptions (Hashtags Included Directly Below)"
        icon={<FileText className="text-green-500 dark:text-green-400" />}
      >
        <div className="space-y-8">
          {descriptions.map((desc, idx) => {
            // Ensure full combined content includes description + hashtags
            const fullContent = desc.includes('#') ? desc : `${desc.trim()}\n\n${hashtagsString}`;

            return (
              <div
                key={idx}
                className="bg-primary-50 dark:bg-slate-900/50 rounded-lg border border-primary-200 dark:border-slate-700 overflow-hidden shadow-sm"
              >
                {/* Header with Quick 1-Click Copy */}
                <div className="flex flex-wrap justify-between items-center px-4 py-3 bg-primary-100/60 dark:bg-slate-800 border-b border-primary-200 dark:border-slate-700 gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Option {idx + 1} • Complete Description & Hashtags
                  </span>
                  <div className="flex items-center gap-2">
                    <CopyActionButton text={fullContent} label="Copy Description + Hashtags" />
                  </div>
                </div>

                {/* Description Body */}
                <div className="p-5">
                  <pre className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {fullContent}
                  </pre>
                </div>

                {/* Attached Hashtags Bar Directly Under Description */}
                <div className="px-5 py-3.5 bg-white/70 dark:bg-slate-950/40 border-t border-primary-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase">
                      <Hash className="w-3.5 h-3.5 text-primary-500" /> Hashtags:
                    </span>
                    {hashtagsList.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs font-semibold px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded border border-primary-200 dark:border-primary-800/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <CopyButton text={hashtagsString} />
                </div>
              </div>
            );
          })}
        </div>
      </ResultCard>

      {/* SEO Tags & Technical Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResultCard title="SEO Tags (YouTube Search Tags)" icon={<Tag className="text-purple-500 dark:text-purple-400" />}>
          <div className="relative">
            <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50 min-h-[120px]">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{tagsString}</p>
            </div>
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className={`${tagsCount > 500 ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {tagsCount}/500 characters
              </span>
              <CopyActionButton text={tagsString} label="Copy All Tags" />
            </div>
          </div>
        </ResultCard>

        <ResultCard title="Technical Recommendations" icon={<Settings className="text-slate-500 dark:text-slate-400" />}>
          <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50 h-full flex flex-col justify-center space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolution</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">1920x1080 (HD / 4K)</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Aspect Ratio</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">16:9 (Long) / 9:16 (Shorts)</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Thumbnail Size</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">1280x720 (Recommended)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Max File Size</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">2 MB</span>
            </div>
          </div>
        </ResultCard>
      </div>

      {/* Thumbnail Strategy */}
      <ResultCard title="Thumbnail Strategy & AI Creator" icon={<ImageIcon className="text-orange-500 dark:text-orange-400" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Text Overlay Idea</h4>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                "{data.thumbnailText}"
              </p>
              <CopyButton text={data.thumbnailText} />
            </div>
          </div>
          <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Suggested Filename</h4>
            <div className="flex justify-between items-center">
              <p className="text-sm text-primary-600 dark:text-primary-300 font-mono truncate">{data.fileName}</p>
              <CopyButton text={data.fileName} />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">AI Image Prompt</h4>
            <CopyButton text={data.thumbnailPrompt} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-4">{data.thumbnailPrompt}</p>
          <button
            onClick={onGenerateImage}
            disabled={isGeneratingImage}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20 transform hover:scale-[1.01]"
          >
            {isGeneratingImage ? 'Generating Viral Thumbnail Variations...' : '✨ Generate Viral Thumbnail Variations'}
          </button>
        </div>
      </ResultCard>
    </div>
  );
};

// --- Helper Components ---

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-6 shadow-lg shadow-primary-900/5 dark:shadow-none transition-colors duration-300">
    <div className="flex items-center gap-2 mb-6 border-b border-primary-100 dark:border-slate-700 pb-3">
      {icon}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const CopyableItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="group flex items-center justify-between p-3 bg-primary-50 dark:bg-slate-900/50 rounded-lg border border-primary-100 dark:border-slate-700/50 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors">
    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex-1 mr-4">{text}</p>
    <CopyButton text={text} />
  </div>
);

const CopyActionButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
        copied
          ? 'bg-green-600 text-white shadow-sm'
          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" /> Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> {label}
        </>
      )}
    </button>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-primary-100 dark:hover:bg-slate-700"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

export default OutputSection;
