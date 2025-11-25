import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, className }) => {
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
        "border-2 border-dashed border-gray-300 rounded-xl p-12",
        "flex flex-col items-center justify-center text-center",
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
      <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
        <div className="bg-blue-100 p-4 rounded-full mb-4 dark:bg-blue-900">
          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Upload PDF File
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Drag and drop or click to browse
        </p>
        <div className="flex items-center text-sm text-gray-400">
          <FileText className="w-4 h-4 mr-1" />
          <span>Supports PDF files only</span>
        </div>
      </label>
    </div>
  );
};
