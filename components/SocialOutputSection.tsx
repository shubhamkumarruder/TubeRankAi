
import React, { useState } from 'react';
import { SocialOutputData, SocialPlatform } from '../types';
import { Copy, Check, MessageCircle, Layout, Image as ImageIcon, Globe, FileText } from 'lucide-react';

interface SocialOutputSectionProps {
  data: SocialOutputData | null;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const SocialOutputSection: React.FC<SocialOutputSectionProps> = ({ data, onGenerateImage, isGeneratingImage }) => {
  if (!data) return null;

  const isInstagram = data.platform === SocialPlatform.INSTAGRAM;

  // Combine caption and hashtags for Instagram to ensure they are applied together
  const instagramContent = isInstagram 
      ? `${data.caption || ''}\n\n${data.hashtags?.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ') || ''}`
      : '';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* --- INSTAGRAM OUTPUT --- */}
      {isInstagram && (
        <>
           <ResultCard title="Instagram Caption & Hashtags" icon={<MessageCircle className="text-pink-500 dark:text-pink-400" />}>
                <div className="bg-primary-50 dark:bg-slate-900/50 rounded-lg border border-primary-100 dark:border-slate-700/50 p-4">
                    <div className="flex justify-end mb-2">
                         <CopyButton text={instagramContent} />
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {instagramContent}
                    </p>
                </div>
            </ResultCard>

             <ResultCard title="Story Version" icon={<Layout className="text-orange-500 dark:text-orange-400" />}>
                <div className="bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30 p-5">
                    <h4 className="text-xs font-bold text-orange-600 dark:text-orange-300 uppercase mb-2">Text Overlay Idea</h4>
                     <div className="flex justify-between items-start">
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-lg leading-tight">
                            "{data.storyContent}"
                        </p>
                        <CopyButton text={data.storyContent || ''} />
                     </div>
                </div>
            </ResultCard>

            <ResultCard title="Reel Thumbnail" icon={<ImageIcon className="text-indigo-500 dark:text-indigo-400" />}>
                 <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">AI Prompt</h4>
                             <p className="text-sm text-slate-600 dark:text-slate-400 italic">{data.thumbnailPrompt}</p>
                        </div>
                        <CopyButton text={data.thumbnailPrompt || ''} />
                    </div>
                    <button
                        onClick={onGenerateImage}
                        disabled={isGeneratingImage}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-pink-500/20 transform hover:scale-[1.01]"
                    >
                        {isGeneratingImage ? 'Generating Reel Thumbnails...' : '✨ Generate Reel Thumbnails (9:16)'}
                    </button>
                 </div>
            </ResultCard>
        </>
      )}

      {/* --- BLOG OUTPUT --- */}
      {!isInstagram && (
        <>
            <ResultCard title="SEO Meta Data" icon={<Globe className="text-blue-500 dark:text-blue-400" />}>
                 <div className="space-y-4">
                     <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Page Title (H1)</h4>
                             <CopyButton text={data.blogTitle || ''} />
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{data.blogTitle}</p>
                     </div>

                     <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Meta Description</h4>
                             <CopyButton text={data.metaDescription || ''} />
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{data.metaDescription}</p>
                        <p className="text-xs text-slate-400 mt-2 text-right">{data.metaDescription?.length || 0}/160 chars</p>
                     </div>
                 </div>
            </ResultCard>

             <ResultCard title="Article Outline & Content" icon={<FileText className="text-green-500 dark:text-green-400" />}>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-primary-100 dark:border-slate-700 prose prose-sm dark:prose-invert max-w-none">
                    <div className="flex justify-end mb-4 no-prose">
                        <CopyButton text={data.blogContent || ''} />
                    </div>
                    <div className="whitespace-pre-wrap">
                        {data.blogContent}
                    </div>
                 </div>
            </ResultCard>
        </>
      )}

    </div>
  );
};

// --- Helper Components ---

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-6 shadow-lg shadow-primary-900/5 dark:shadow-none transition-colors duration-300">
    <div className="flex items-center gap-2 mb-6 border-b border-primary-100 dark:border-slate-700 pb-3">
      {icon}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
);

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

export default SocialOutputSection;
