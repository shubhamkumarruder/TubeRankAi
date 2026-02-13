
import React, { useState, useEffect } from 'react';
import { Youtube, Moon, Sun, Wand2, BarChart2, Menu, X } from 'lucide-react';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import ThumbnailDisplay from './components/ThumbnailDisplay';
import { generateSeoContent, generateThumbnailImages, auditChannel } from './services/geminiService';
import { SeoInputData, SeoOutputData, AppMode, ChannelAuditData, VideoFormat } from './types';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [seoData, setSeoData] = useState<SeoOutputData | null>(null);
  const [auditData, setAuditData] = useState<ChannelAuditData | null>(null);

  // Thumbnail State
  const [currentVideoFormat, setCurrentVideoFormat] = useState<VideoFormat>(VideoFormat.LONG);

  const [isProcessing, setIsProcessing] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | undefined>();

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleModeChange = (newMode: AppMode) => {
      setMode(newMode);
      setMobileMenuOpen(false); // Close mobile menu on selection
  };

  // Handler for Generator Mode
  const handleGenerateContent = async (input: SeoInputData) => {
    setIsProcessing(true);
    setSeoData(null);
    setThumbnailUrls([]);
    setImageError(undefined);
    // Track format for thumbnail generation later
    setCurrentVideoFormat(input.videoFormat as VideoFormat);

    try {
      const data = await generateSeoContent(input);
      setSeoData(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for Audit Mode
  const handleAuditChannel = async (url: string) => {
      setIsProcessing(true);
      setAuditData(null);
      
      try {
          const data = await auditChannel(url);
          setAuditData(data);
      } catch (error) {
          console.error(error);
          alert("Failed to audit channel. Ensure the link is valid and public.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleGenerateThumbnail = async () => {
    let prompt = '';
    if (mode === AppMode.GENERATOR && seoData?.thumbnailPrompt) {
        prompt = seoData.thumbnailPrompt;
    }

    if (!prompt) return;

    setIsGeneratingImage(true);
    setImageError(undefined);
    setThumbnailUrls([]);
    
    const aspectRatio = currentVideoFormat === VideoFormat.SHORT ? '9:16' : '16:9';

    try {
      const urls = await generateThumbnailImages(prompt, aspectRatio);
      setThumbnailUrls(urls);
    } catch (error) {
      console.error(error);
      setImageError("Could not generate images. Please try again later.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Reset data when switching modes
  useEffect(() => {
      setSeoData(null);
      setAuditData(null);
      setThumbnailUrls([]);
  }, [mode]);

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-primary-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">TubeRank AI</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-primary-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen sticky top-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="h-full flex flex-col p-6">
            <div className="hidden md:flex items-center gap-3 mb-8">
                <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-600/20">
                <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">TubeRank AI</h1>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Tools</p>
                <button
                    onClick={() => handleModeChange(AppMode.GENERATOR)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        mode === AppMode.GENERATOR 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <Wand2 className="w-5 h-5" /> Generator
                </button>
                <button
                    onClick={() => handleModeChange(AppMode.AUDIT)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        mode === AppMode.AUDIT
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <BarChart2 className="w-5 h-5" /> Channel Audit
                </button>
            </nav>

            <div className="pt-6 border-t border-primary-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-primary-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-slate-700 transition-all"
                    >
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                </div>
            </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8 md:p-12">
            
            {/* Context Header */}
            <div className="mb-8">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {mode === AppMode.GENERATOR && 'Content Generator'}
                    {mode === AppMode.AUDIT && 'Channel Audit'}
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400">
                    {mode === AppMode.GENERATOR && 'Create viral metadata and thumbnails for your next video.'}
                    {mode === AppMode.AUDIT && 'Analyze channel performance and uncover growth opportunities.'}
                 </p>
            </div>

            {/* Layout: Input Section (Full Width) -> Output Section (Full Width) */}
            <div className="space-y-8">
                <div className="w-full">
                    <InputSection 
                        mode={mode} 
                        onGenerate={handleGenerateContent} 
                        onAudit={handleAuditChannel}
                        isGenerating={isProcessing} 
                    />
                </div>

                {(seoData || auditData) ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <OutputSection 
                        mode={mode}
                        data={seoData}
                        auditData={auditData}
                        onGenerateImage={handleGenerateThumbnail}
                        isGeneratingImage={isGeneratingImage}
                    />
                    <ThumbnailDisplay 
                        imageUrls={thumbnailUrls} 
                        loading={isGeneratingImage}
                        error={imageError}
                        isShorts={currentVideoFormat === VideoFormat.SHORT}
                    />
                </div>
                ) : (
                // Empty State
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-white/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-primary-200 dark:border-slate-800 transition-all">
                    <div className="p-4 bg-primary-50 dark:bg-slate-800/50 rounded-full mb-4">
                    {mode === AppMode.GENERATOR && <Wand2 className="w-8 h-8 opacity-20 text-slate-900 dark:text-white" />}
                    {mode === AppMode.AUDIT && <BarChart2 className="w-8 h-8 opacity-20 text-slate-900 dark:text-white" />}
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-500">
                        {mode === AppMode.GENERATOR && 'Results will appear here'}
                        {mode === AppMode.AUDIT && 'Audit report will appear here'}
                    </p>
                </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
