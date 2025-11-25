import React from 'react';
import { Settings, ArrowDown, ArrowRight } from 'lucide-react';
import type { StitchConfig } from '../utils/pdfProcessor';

interface ControlsProps {
  config: StitchConfig;
  onChange: (config: StitchConfig) => void;
  totalPages: number;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange, totalPages, disabled }) => {
  const handleChange = (key: keyof StitchConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
        <Settings className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
      </div>

      {/* Split Count */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
          <span>Split into N Images</span>
          <span className="text-gray-400 text-xs">Total pages: {totalPages}</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max={totalPages || 10}
            value={config.splitCount}
            onChange={(e) => handleChange('splitCount', parseInt(e.target.value))}
            disabled={disabled}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="w-12 text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
            {config.splitCount}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Will generate {config.splitCount} images, approx {Math.ceil(totalPages / config.splitCount)} pages each.
        </p>
      </div>

      {/* Direction */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stitching Direction</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleChange('direction', 'vertical')}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
              config.direction === 'vertical'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <ArrowDown className="w-4 h-4" />
            <span>Vertical</span>
          </button>
          <button
            onClick={() => handleChange('direction', 'horizontal')}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
              config.direction === 'horizontal'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>Horizontal</span>
          </button>
        </div>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Quality</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleChange('quality', 'high')}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
              config.quality === 'high'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <span className="font-medium">High Quality</span>
            <span className="text-xs opacity-75">PNG Format</span>
          </button>
          <button
            onClick={() => handleChange('quality', 'normal')}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
              config.quality === 'normal'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <span className="font-medium">Normal</span>
            <span className="text-xs opacity-75">JPG Format</span>
          </button>
        </div>
      </div>
    </div>
  );
};
