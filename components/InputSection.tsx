import React, { useState } from 'react';
import { SeoInputData, Tone, Language, VideoFormat, YouTubeCategory } from '../types';
import { Sparkles, Loader2, Search, Video, Smartphone, FolderTree, Globe } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (data: SeoInputData) => void;
  isGenerating: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isGenerating }) => {
  const [formData, setFormData] = useState<SeoInputData>({
    topic: '',
    category: YouTubeCategory.GENERAL,
    mainKeyword: '',
    secondaryKeywords: '',
    language: Language.ENGLISH,
    tone: Tone.VIRAL,
    videoFormat: VideoFormat.LONG,
    useSearchGrounding: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormatChange = (format: VideoFormat) => {
    setFormData((prev) => ({ ...prev, videoFormat: format }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-6 shadow-xl shadow-primary-900/5 dark:shadow-none backdrop-blur-sm transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Video Details & Category</h2>
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 transition-all select-none">
          <input
            type="checkbox"
            checked={Boolean(formData.useSearchGrounding)}
            onChange={(e) => setFormData((prev) => ({ ...prev, useSearchGrounding: e.target.checked }))}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span>Google Search Grounding (Live Trends)</span>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Row 1: Topic | Category | Format */}
          <div className="lg:col-span-5 space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Video Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="topic"
              required
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. How to start an online business in 2026"
              className="w-full h-[46px] bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
            />
          </div>

          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-primary-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                YouTube Category <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">(New)</span>
              </label>
            </div>
            <div className="relative h-[46px]">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-3 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.values(YouTubeCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Format</label>
            <div className="flex bg-primary-50 dark:bg-slate-900 rounded-lg p-1.5 border border-primary-200 dark:border-slate-700 h-[46px]">
              <button
                type="button"
                onClick={() => handleFormatChange(VideoFormat.LONG)}
                className={`flex-1 flex flex-row items-center justify-center gap-2 rounded-md transition-all text-xs sm:text-sm font-medium whitespace-nowrap px-1 ${
                  formData.videoFormat === VideoFormat.LONG
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Standard 16:9 Video"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Long (16:9)</span>
                <span className="sm:hidden">16:9</span>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange(VideoFormat.SHORT)}
                className={`flex-1 flex flex-row items-center justify-center gap-2 rounded-md transition-all text-xs sm:text-sm font-medium whitespace-nowrap px-1 ${
                  formData.videoFormat === VideoFormat.SHORT
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Vertical 9:16 Shorts"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Shorts (9:16)</span>
                <span className="sm:hidden">9:16</span>
              </button>
            </div>
          </div>

          {/* Row 2: Language | Tone | Main KW | Secondary KW | Submit Button */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Language</label>
            <div className="relative h-[46px]">
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full h-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.values(Language).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Tone</label>
            <div className="relative h-[46px]">
              <select
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="w-full h-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.values(Tone).map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Main Keyword</label>
              <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">
                Auto
              </span>
            </div>
            <div className="relative h-[46px]">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="mainKeyword"
                value={formData.mainKeyword}
                onChange={handleChange}
                placeholder="Target search keyword..."
                className="w-full h-full pl-9 bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Secondary KW</label>
            <div className="h-[46px]">
              <input
                type="text"
                name="secondaryKeywords"
                value={formData.secondaryKeywords}
                onChange={handleChange}
                placeholder="Optional tags..."
                className="w-full h-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="h-[46px] w-full bg-gradient-to-r text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed from-primary-600 to-indigo-600 shadow-primary-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Complete SEO
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputSection;
