
import React, { useState } from 'react';
import { SeoOutputData, ChannelAuditData, AppMode } from '../types';
import { Copy, Check, FileText, Tag, Image as ImageIcon, Type, Settings, TrendingUp, Users, Eye, PlaySquare, AlertCircle } from 'lucide-react';

interface OutputSectionProps {
  mode: AppMode;
  data: SeoOutputData | null;
  auditData: ChannelAuditData | null;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ mode, data, auditData, onGenerateImage, isGeneratingImage }) => {
  
  // Render Generator Output (Existing logic)
  if (mode === AppMode.GENERATOR && data) {
    const tagsString = data.tags.join(', ');
    const tagsCount = tagsString.length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <ResultCard title="Viral Titles" icon={<Type className="text-blue-500 dark:text-blue-400" />}>
            <div className="space-y-3">
              {data.titles.map((title, idx) => (
                <CopyableItem key={idx} text={title} />
              ))}
            </div>
          </ResultCard>

          <ResultCard title="Structured SEO Descriptions" icon={<FileText className="text-green-500 dark:text-green-400" />}>
            <div className="space-y-8">
              {data.descriptions.map((desc, idx) => (
                <div key={idx} className="bg-primary-50 dark:bg-slate-900/50 rounded-lg border border-primary-100 dark:border-slate-700/50 overflow-hidden">
                  <div className="flex justify-between items-center p-3 bg-primary-100/50 dark:bg-slate-800/50 border-b border-primary-100 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Option {idx + 1}</span>
                    <CopyButton text={desc} />
                  </div>
                  <div className="p-5">
                    <pre className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {desc}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResultCard title="SEO Tags" icon={<Tag className="text-purple-500 dark:text-purple-400" />}>
               <div className="relative">
                 <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50 min-h-[120px]">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{tagsString}</p>
                 </div>
                 <div className="mt-2 flex justify-between items-center text-xs">
                    <span className={`${tagsCount > 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                        {tagsCount}/500 chars
                    </span>
                    <CopyButton text={tagsString} />
                 </div>
               </div>
            </ResultCard>

            <ResultCard title="Technical Recommended" icon={<Settings className="text-slate-500 dark:text-slate-400" />}>
                <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50 h-full flex flex-col justify-center space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolution</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">1920x1080 (HD)</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Aspect Ratio</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">16:9</span>
                   </div>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Thumbnail Size</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">1280x720 (Min)</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Max File Size</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">2 MB</span>
                   </div>
                </div>
            </ResultCard>
          </div>

          <ResultCard title="Thumbnail Strategy" icon={<ImageIcon className="text-orange-500 dark:text-orange-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-50 dark:bg-slate-900/50 p-4 rounded-lg border border-primary-100 dark:border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Text Overlay Idea</h4>
                <div className="flex justify-between items-center">
                   <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">"{data.thumbnailText}"</p>
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
                 {isGeneratingImage ? 'Generating 4 Viral Variations...' : '✨ Generate 4 Viral Thumbnail Variations'}
               </button>
            </div>
          </ResultCard>
        </div>
    );
  }

  // Render Audit Output
  if (mode === AppMode.AUDIT && auditData) {
      // Logic for "Not Watched"
      // Note: This is an estimation based on Sub count vs Average Views.
      const subscribers = auditData.subscriberCountNumber;
      const avgViews = auditData.avgViewsPerVideo;
      const notWatched = Math.max(0, subscribers - avgViews);
      
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<Users className="text-blue-500" />} label="Subscribers" value={auditData.subscribers} />
                <StatCard icon={<Eye className="text-green-500" />} label="Total Views" value={auditData.totalViews} />
                <StatCard icon={<PlaySquare className="text-red-500" />} label="Videos" value={auditData.videoCount} />
            </div>

            <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <AlertCircle className="text-purple-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Engagement Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Watched (Avg. Views)</span>
                                <span className="text-sm font-bold text-green-500">{avgViews.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (avgViews / subscribers) * 100)}%` }}></div>
                            </div>
                        </div>
                        <div>
                             <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Did Not Watch (Inactive Subs)</span>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{notWatched.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${Math.min(100, (notWatched / subscribers) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Audit Summary</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{auditData.auditSummary}</p>
                    </div>
                </div>
            </div>

            <ResultCard title="Top Performing Topics" icon={<TrendingUp className="text-orange-500" />}>
                <div className="flex flex-wrap gap-2">
                    {auditData.topPerformingContent.map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                            {topic}
                        </span>
                    ))}
                </div>
            </ResultCard>
        </div>
      );
  }

  return null;
};

// --- Helper Components ---

const StatBox: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="mb-2 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm">{icon}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate w-full">{value}</p>
    </div>
);

const ScoreGauge: React.FC<{ label: string; score: number; color: 'blue' | 'purple' }> = ({ label, score, color }) => {
    const isBlue = color === 'blue';
    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</p>
                <p className={`text-2xl font-black ${isBlue ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>{score}/100</p>
            </div>
             <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        className="text-slate-200 dark:text-slate-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={`${isBlue ? 'text-blue-500' : 'text-purple-500'}`}
                        strokeDasharray={`${score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    )
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-4 shadow flex items-center gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full">{icon}</div>
        <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">{label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
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
