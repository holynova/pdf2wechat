import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../store/i18n';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, className }) => {
  const { t } = useI18n();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={clsx(
        "border-2 border-dashed border-gray-300 rounded-xl p-8",
        "flex flex-col items-center justify-center text-center h-full min-h-[300px]",
        "hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer",
        "bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-700",
        className
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
        id="pdf-upload"
      />
      <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
        <div className="bg-blue-100 p-3 rounded-full mb-3 dark:bg-blue-900">
          <Upload className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
          {t('uploadTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {t('uploadDesc')}
        </p>
        <div className="flex items-center text-xs text-gray-400">
          <FileText className="w-3 h-3 mr-1" />
          <span>{t('uploadSupport')}</span>
        </div>
      </label>
    </div>
  );
};
