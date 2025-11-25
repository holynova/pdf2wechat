import React, { useState } from 'react';
import { Download, ZoomIn, X } from 'lucide-react';
import { useI18n, formatString } from '../store/i18n';

interface PreviewGalleryProps {
  images: string[];
  onDownload: () => void;
}

export const PreviewGallery: React.FC<PreviewGalleryProps> = ({ images, onDownload }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t } = useI18n();

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('previewTitle')} ({images.length})
          </h2>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            <Download className="w-5 h-5" />
            {t('downloadAll')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.slice(0, 10).map((src, index) => (
            <div 
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <img
                  src={src}
                  alt={`Stitched part ${index + 1}`}
                  className="max-w-full max-h-full object-contain shadow-sm"
                />
              </div>
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <button
                  onClick={() => setSelectedImage(src)}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                  title="View full size"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
              </div>
              
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                {formatString(t('part'), { n: index + 1 })}
              </div>
            </div>
          ))}
        </div>
        
        {images.length > 10 && (
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
            {formatString(t('moreImages'), { n: images.length - 10 })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
