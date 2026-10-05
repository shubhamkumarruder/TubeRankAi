import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Moon,
  Sun,
  Wand2,
  Menu,
  X,
  Share2,
  AlertCircle,
  Bookmark,
  LogIn,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import SocialInputSection from './components/SocialInputSection';
import SocialOutputSection from './components/SocialOutputSection';
import ThumbnailDisplay from './components/ThumbnailDisplay';
import SavedProjectsSection from './components/SavedProjectsSection';
import { generateSeoContent, generateSocialContent, generateThumbnailImages } from './services/geminiService';
import {
  auth,
  signInWithGoogle,
  logout,
  saveProjectToFirestore,
  getSavedProjectsFromFirestore,
  deleteSavedProjectFromFirestore,
  SavedProjectItem,
} from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  SeoInputData,
  SeoOutputData,
  AppMode,
  VideoFormat,
  SocialInputData,
  SocialOutputData,
} from './types';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [mode, setMode] = useState<AppMode>(AppMode.YOUTUBE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Data States
  const [seoData, setSeoData] = useState<SeoOutputData | null>(null);
  const [socialData, setSocialData] = useState<SocialOutputData | null>(null);
  const [lastTopic, setLastTopic] = useState<string>('');

  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProjectItem[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavedProject, setIsSavedProject] = useState(false);

  // Thumbnail State
  const [currentVideoFormat, setCurrentVideoFormat] = useState<VideoFormat>(VideoFormat.LONG);

  const [isProcessing, setIsProcessing] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | undefined>();
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        loadUserSavedProjects(currentUser.uid);
      } else {
        setSavedProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserSavedProjects = async (uid: string) => {
    setIsLoadingSaved(true);
    try {
      const items = await getSavedProjectsFromFirestore(uid);
      setSavedProjects(items);
    } catch (e) {
      console.warn('Could not load saved projects:', e);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setGenerationError(null);
    setMobileMenuOpen(false);
    if (newMode === AppMode.SAVED && user) {
      loadUserSavedProjects(user.uid);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        showNotification(`Signed in as ${loggedUser.displayName || loggedUser.email}`);
      }
    } catch (e: any) {
      console.error(e);
      setGenerationError(e?.message || 'Failed to sign in with Google');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Signed out successfully');
    } catch (e: any) {
      console.error(e);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Handler for YouTube Mode
  const handleGenerateContent = async (input: SeoInputData) => {
    setIsProcessing(true);
    setSeoData(null);
    setThumbnailUrls([]);
    setImageError(undefined);
    setGenerationError(null);
    setIsSavedProject(false);
    setLastTopic(input.topic);
    setCurrentVideoFormat(input.videoFormat as VideoFormat);

    try {
      const data = await generateSeoContent(input);
      setSeoData(data);
    } catch (error: any) {
      console.error(error);
      setGenerationError(error?.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for Social Mode
  const handleGenerateSocial = async (input: SocialInputData) => {
    setIsProcessing(true);
    setSocialData(null);
    setThumbnailUrls([]);
    setImageError(undefined);
    setGenerationError(null);

    try {
      const data = await generateSocialContent(input);
      setSocialData(data);
    } catch (error: any) {
      console.error(error);
      setGenerationError(error?.message || 'Failed to generate social content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Project to Firestore
  const handleSaveProject = async () => {
    if (!seoData) return;

    if (!user) {
      try {
        const loggedUser = await signInWithGoogle();
        if (!loggedUser) return;
        saveToDb(loggedUser.uid);
      } catch (e: any) {
        setGenerationError('Please sign in with Google to save projects.');
      }
      return;
    }

    saveToDb(user.uid);
  };

  const saveToDb = async (uid: string) => {
    if (!seoData) return;
    setIsSavingProject(true);
    try {
      await saveProjectToFirestore(uid, {
        topic: lastTopic || seoData.titles[0] || 'YouTube Video',
        category: seoData.category || 'General',
        type: 'youtube',
        data: seoData,
      });
      setIsSavedProject(true);
      showNotification('Project saved to your Firebase database!');
      loadUserSavedProjects(uid);
    } catch (e: any) {
      console.error(e);
      setGenerationError('Failed to save project to Firebase.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;
    try {
      await deleteSavedProjectFromFirestore(user.uid, id);
      setSavedProjects((prev) => prev.filter((p) => p.id !== id));
      showNotification('Project removed.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSavedProject = (data: SeoOutputData) => {
    setSeoData(data);
    setMode(AppMode.YOUTUBE);
    setIsSavedProject(true);
    showNotification('Loaded saved project into editor!');
  };

  const handleGenerateThumbnail = async () => {
    let prompt = '';
    let aspectRatio: '16:9' | '9:16' = '16:9';

    if (mode === AppMode.YOUTUBE && seoData?.thumbnailPrompt) {
      prompt = seoData.thumbnailPrompt;
      aspectRatio = currentVideoFormat === VideoFormat.SHORT ? '9:16' : '16:9';
    } else if (mode === AppMode.SOCIAL && socialData?.thumbnailPrompt) {
      prompt = socialData.thumbnailPrompt;
      aspectRatio = '9:16';
    }

    if (!prompt) return;

    setIsGeneratingImage(true);
    setImageError(undefined);
    setThumbnailUrls([]);

    try {
      const urls = await generateThumbnailImages(prompt, aspectRatio);
      setThumbnailUrls(urls);
    } catch (error) {
      console.error(error);
      setImageError('Could not generate images. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-primary-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">TubeRank AI</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 dark:text-slate-300 p-1 rounded-md"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-primary-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen sticky top-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-6 justify-between">
          <div>
            <div className="hidden md:flex items-center gap-3 mb-8">
              <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-600/20">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">TubeRank AI</h1>
                <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">
                  Firebase & AI Studio
                </span>
              </div>
            </div>

            <nav className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Navigation</p>

              <button
                onClick={() => handleModeChange(AppMode.YOUTUBE)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === AppMode.YOUTUBE
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wand2 className="w-4 h-4" /> YouTube SEO
              </button>

              <button
                onClick={() => handleModeChange(AppMode.SOCIAL)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === AppMode.SOCIAL
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Share2 className="w-4 h-4" /> Social & Blog
              </button>

              <button
                onClick={() => handleModeChange(AppMode.SAVED)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === AppMode.SAVED
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4" /> Saved History
                </span>
                {(savedProjects?.length ?? 0) > 0 && (
                  <span className="text-xs bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 px-2 py-0.5 rounded-full font-bold">
                    {savedProjects.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* User Account & Theme Controls */}
          <div className="space-y-4 pt-6 border-t border-primary-100 dark:border-slate-800">
            {/* User Profile */}
            {user ? (
              <div className="bg-primary-50/70 dark:bg-slate-800/60 p-3 rounded-xl border border-primary-100 dark:border-slate-700">
                <div className="flex items-center gap-2.5 mb-2.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User avatar" className="w-8 h-8 rounded-full border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Creator'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 px-2 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-primary-600" /> Sign In with Google
              </button>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dark Mode</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-primary-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-slate-700 transition-all"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              {mode === AppMode.YOUTUBE && 'YouTube SEO & Thumbnail Suite'}
              {mode === AppMode.SOCIAL && 'Social Media & Blog Specialist'}
              {mode === AppMode.SAVED && 'Saved Projects & Database History'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {mode === AppMode.YOUTUBE &&
                'Generate viral titles, targeted category SEO descriptions with built-in hashtags, and 4K thumbnails.'}
              {mode === AppMode.SOCIAL &&
                'Create high-converting Instagram Reels captions with hashtags and long-form SEO blog structures.'}
              {mode === AppMode.SAVED &&
                'Review and reuse your previous SEO strategies stored in your Firestore database.'}
            </p>
          </div>

          {/* Error Banner */}
          {generationError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300 animate-in fade-in">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1 text-sm font-medium">
                <p className="font-semibold mb-0.5">Notice</p>
                <p className="opacity-90">{generationError}</p>
              </div>
              <button
                onClick={() => setGenerationError(null)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dynamic Content Views */}
          <div className="space-y-8">
            {/* --- YOUTUBE MODE --- */}
            {mode === AppMode.YOUTUBE && (
              <>
                <div className="w-full">
                  <InputSection onGenerate={handleGenerateContent} isGenerating={isProcessing} />
                </div>

                <div className="w-full">
                  <OutputSection
                    data={seoData}
                    onGenerateImage={handleGenerateThumbnail}
                    isGeneratingImage={isGeneratingImage}
                    onSaveProject={handleSaveProject}
                    isSavingProject={isSavingProject}
                    isSavedProject={isSavedProject}
                  />
                </div>

                {(thumbnailUrls.length > 0 || isGeneratingImage || imageError) && (
                  <div className="w-full">
                    <ThumbnailDisplay
                      images={thumbnailUrls}
                      imageUrls={thumbnailUrls}
                      aspectRatio={currentVideoFormat === VideoFormat.SHORT ? '9:16' : '16:9'}
                      isShorts={currentVideoFormat === VideoFormat.SHORT}
                      isLoading={isGeneratingImage}
                      loading={isGeneratingImage}
                      error={imageError}
                    />
                  </div>
                )}
              </>
            )}

            {/* --- SOCIAL MODE --- */}
            {mode === AppMode.SOCIAL && (
              <>
                <div className="w-full">
                  <SocialInputSection onGenerate={handleGenerateSocial} isGenerating={isProcessing} />
                </div>

                <div className="w-full">
                  <SocialOutputSection
                    data={socialData}
                    onGenerateImage={handleGenerateThumbnail}
                    isGeneratingImage={isGeneratingImage}
                  />
                </div>

                {(thumbnailUrls.length > 0 || isGeneratingImage || imageError) && (
                  <div className="w-full">
                    <ThumbnailDisplay
                      images={thumbnailUrls}
                      imageUrls={thumbnailUrls}
                      aspectRatio="9:16"
                      isShorts={true}
                      isLoading={isGeneratingImage}
                      loading={isGeneratingImage}
                      error={imageError}
                    />
                  </div>
                )}
              </>
            )}

            {/* --- SAVED PROJECTS MODE --- */}
            {mode === AppMode.SAVED && (
              <SavedProjectsSection
                projects={savedProjects}
                isLoading={isLoadingSaved}
                onSelectProject={handleSelectSavedProject}
                onDeleteProject={handleDeleteProject}
                userEmail={user?.email}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
