
import React, { useState } from 'react';
import { SocialInputData, SocialPlatform, Tone } from '../types';
import { Sparkles, Loader2, Instagram, FileText } from 'lucide-react';

interface SocialInputSectionProps {
  onGenerate: (data: SocialInputData) => void;
  isGenerating: boolean;
}

const SocialInputSection: React.FC<SocialInputSectionProps> = ({ onGenerate, isGenerating }) => {
  const [formData, setFormData] = useState<SocialInputData>({
    platform: SocialPlatform.INSTAGRAM,
    topic: '',
    keywords: '',
    tone: Tone.VIRAL,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (platform: SocialPlatform) => {
    setFormData(prev => ({ ...prev, platform }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-6 shadow-xl shadow-primary-900/5 dark:shadow-none backdrop-blur-sm transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-pink-500 dark:text-pink-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Social Media & Blog</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Platform Selection */}
        <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Select Platform</label>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handlePlatformChange(SocialPlatform.INSTAGRAM)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.platform === SocialPlatform.INSTAGRAM
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    <Instagram className="w-5 h-5" />
                    <span className="font-semibold">Instagram</span>
                </button>

                <button
                    type="button"
                    onClick={() => handlePlatformChange(SocialPlatform.BLOG)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.platform === SocialPlatform.BLOG
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">SEO Blog</span>
                </button>
            </div>
        </div>

        {/* Topic */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {formData.platform === SocialPlatform.INSTAGRAM ? 'What is the post about?' : 'Blog Topic / Title Idea'} <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="topic"
                required
                value={formData.topic}
                onChange={handleChange}
                placeholder={formData.platform === SocialPlatform.INSTAGRAM ? "e.g. A day in the life of a developer" : "e.g. Top 10 tips for SEO in 2024"}
                className="w-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
            />
        </div>

        {/* Keywords & Tone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Keywords (Optional)</label>
                <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="Keywords to include..."
                    className="w-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tone</label>
                <div className="relative">
                    <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    >
                    {Object.values(Tone).map((tone) => (
                        <option key={tone} value={tone}>{tone}</option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
        </div>

        <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-3.5 bg-gradient-to-r text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
                ${formData.platform === SocialPlatform.INSTAGRAM ? 'from-pink-500 to-purple-600 shadow-pink-500/20' : 'from-blue-600 to-cyan-600 shadow-blue-500/20'}
            `}
        >
            {isGenerating ? (
                <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Content...
                </>
            ) : (
                <>
                <Sparkles className="w-5 h-5" /> Generate {formData.platform === SocialPlatform.INSTAGRAM ? 'Instagram Post' : 'Blog Post'}
                </>
            )}
        </button>

      </form>
    </div>
  );
};

export default SocialInputSection;
