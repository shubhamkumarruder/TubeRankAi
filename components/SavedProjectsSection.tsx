import React from 'react';
import { SavedProjectItem } from '../services/firebase';
import { Bookmark, Trash2, ArrowUpRight, FolderTree, Calendar, Tag, FileText, Check, Copy } from 'lucide-react';
import { SeoOutputData } from '../types';

interface SavedProjectsSectionProps {
  projects: SavedProjectItem[];
  isLoading: boolean;
  onSelectProject: (data: SeoOutputData) => void;
  onDeleteProject: (id: string) => void;
  userEmail?: string | null;
}

const SavedProjectsSection: React.FC<SavedProjectsSectionProps> = ({
  projects,
  isLoading,
  onSelectProject,
  onDeleteProject,
  userEmail,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyTags = (id: string, tags: string[]) => {
    navigator.clipboard.writeText(tags.join(', '));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const projectList = Array.isArray(projects) ? projects : [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your Firebase saved projects...</p>
      </div>
    );
  }

  if (projectList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-12 text-center">
        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Saved Projects Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          {userEmail
            ? 'Generate YouTube SEO titles & descriptions, then click "Save Project to Firebase" to save them here for quick access anytime!'
            : 'Sign in with your Google account to save and access your YouTube SEO history across devices.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Saved YouTube Projects ({projectList.length})
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stored securely in your Firebase Firestore database
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projectList.map((item) => {
          const seo = item.data as SeoOutputData;
          const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800/60 border border-primary-100 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs font-semibold border border-primary-200 dark:border-primary-800/40">
                    <FolderTree className="w-3.5 h-3.5" /> {item.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {item.topic}
                </h4>

                {seo?.titles && Array.isArray(seo.titles) && seo.titles.length > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-primary-50/60 dark:bg-slate-900/60 p-2.5 rounded-lg mb-3 line-clamp-2 italic">
                    "{seo.titles[0]}"
                  </p>
                )}

                {seo?.tags && Array.isArray(seo.tags) && (
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> {seo.tags.length} Tags
                    </span>
                    <button
                      onClick={() => handleCopyTags(item.id, seo.tags)}
                      className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Tags
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  onClick={() => onSelectProject(seo)}
                  className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> View & Edit Details
                </button>
                <button
                  onClick={() => onDeleteProject(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Delete from Firebase"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavedProjectsSection;
