import React from 'react';
import { Settings, ArrowDown, ArrowRight } from 'lucide-react';
import type { StitchConfig } from '../utils/pdfProcessor';
import { useI18n, formatString } from '../store/i18n';

interface ControlsProps {
  config: StitchConfig;
  onChange: (config: StitchConfig) => void;
  onGenerate: () => void;
  totalPages: number;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange, onGenerate, totalPages, disabled }) => {
  const { t } = useI18n();
  
  const handleChange = (key: keyof StitchConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
        <Settings className="w-4 h-4 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('configTitle')}</h2>
      </div>

      {/* Split Count */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex justify-between">
          <span>{t('splitCount')}</span>
          <span className="text-gray-400">{formatString(t('totalPages'), { n: totalPages })}</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max={totalPages || 10}
            value={config.splitCount}
            onChange={(e) => handleChange('splitCount', parseInt(e.target.value))}
            disabled={disabled}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <input 
            type="number"
            min="1"
            max={totalPages || 10}
            value={config.splitCount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= (totalPages || 10)) {
                handleChange('splitCount', val);
              }
            }}
            disabled={disabled}
            className="w-14 text-center font-mono text-base font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-md p-0.5 bg-transparent"
          />
        </div>
        <p className="text-[10px] text-gray-500">
          {formatString(t('willGenerate'), { n: config.splitCount, p: Math.ceil(totalPages / config.splitCount) })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Options: Gap & Border */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('stitchingOptions')}</label>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => handleChange('gap', !config.gap)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 p-2 rounded-md border text-xs transition-all ${
                config.gap
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <span className="w-3 h-3 border border-current rounded-[2px] flex items-center justify-center">
                {config.gap && <span className="w-1.5 h-1.5 bg-current rounded-[1px]" />}
              </span>
              <span>{t('addGap')}</span>
            </button>
            <button
              onClick={() => handleChange('border', !config.border)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 p-2 rounded-md border text-xs transition-all ${
                config.border
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <span className="w-3 h-3 border border-current rounded-[2px] flex items-center justify-center">
                {config.border && <span className="w-1.5 h-1.5 bg-current rounded-[1px]" />}
              </span>
              <span>{t('addBorder')}</span>
            </button>
          </div>
        </div>

        {/* Direction */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('direction')}</label>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => handleChange('direction', 'vertical')}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 p-2 rounded-md border text-xs transition-all ${
                config.direction === 'vertical'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <ArrowDown className="w-3 h-3" />
              <span>{t('vertical')}</span>
            </button>
            <button
              onClick={() => handleChange('direction', 'horizontal')}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 p-2 rounded-md border text-xs transition-all ${
                config.direction === 'horizontal'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <ArrowRight className="w-3 h-3" />
              <span>{t('horizontal')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quality */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('quality')}</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleChange('quality', 'high')}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs transition-all ${
              config.quality === 'high'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <span className="font-medium">{t('highQuality')}</span>
            <span className="text-[10px] opacity-75">{t('highQualityDesc')}</span>
          </button>
          <button
            onClick={() => handleChange('quality', 'normal')}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs transition-all ${
              config.quality === 'normal'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <span className="font-medium">{t('normalQuality')}</span>
            <span className="text-[10px] opacity-75">{t('normalQualityDesc')}</span>
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={disabled}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-2 text-sm"
      >
        <Settings className="w-4 h-4" />
        {t('startConversion')}
      </button>
    </div>
  );
};
