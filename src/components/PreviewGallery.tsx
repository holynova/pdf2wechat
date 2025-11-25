import React from 'react';
import { Download, ZoomIn } from 'lucide-react';

interface PreviewGalleryProps {
  images: string[];
  onDownload: () => void;
}

export const PreviewGallery: React.FC<PreviewGalleryProps> = ({ images, onDownload }) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Preview ({images.length} images)
        </h2>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
        >
          <Download className="w-5 h-5" />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((src, index) => (
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
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                title="Open full size"
              >
                <ZoomIn className="w-6 h-6" />
              </a>
            </div>
            
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
              Part {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
