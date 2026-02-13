import React from 'react';
import { Download } from 'lucide-react';

interface ThumbnailDisplayProps {
  imageUrls: string[];
  loading: boolean;
  error?: string;
  isShorts: boolean;
}

const ThumbnailDisplay: React.FC<ThumbnailDisplayProps> = ({ imageUrls, loading, error, isShorts }) => {
  if (imageUrls.length === 0 && !loading && !error) return null;

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-xl p-6 shadow-lg shadow-primary-900/5 dark:shadow-none animate-in fade-in zoom-in duration-500 mt-6 transition-colors duration-300">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          AI Generated Thumbnails ({isShorts ? '9:16 Shorts' : '16:9 Long Form'})
      </h3>
      
      {loading ? (
        <div className={`relative w-full rounded-lg overflow-hidden bg-primary-50 dark:bg-slate-900 border border-primary-200 dark:border-slate-700 flex items-center justify-center ${isShorts ? 'min-h-[400px] aspect-[9/16] max-w-sm mx-auto' : 'min-h-[300px] aspect-video'}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Rendering 4 variations...</p>
          </div>
        </div>
      ) : error ? (
         <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
           <p className="text-red-600 dark:text-red-400 mb-2 font-medium">Failed to generate images</p>
           <p className="text-xs text-red-500 dark:text-red-300">{error}</p>
         </div>
      ) : (
        <div className={`grid gap-4 ${isShorts ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {imageUrls.map((url, index) => (
            <div key={index} className={`relative group rounded-lg overflow-hidden border border-primary-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all ${isShorts ? 'aspect-[9/16]' : 'aspect-video'}`}>
              <img src={url} alt={`Generated Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                 <a 
                  href={url} 
                  download={`thumbnail-variant-${index + 1}.png`}
                  className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                V{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && imageUrls.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 text-center">
          Note: AI generated. Download and add text in your favorite editor.
        </p>
      )}
    </div>
  );
};

export default ThumbnailDisplay;