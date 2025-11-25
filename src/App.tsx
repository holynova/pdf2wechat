import { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { Controls } from './components/Controls';
import { PreviewGallery } from './components/PreviewGallery';
import { loadPDF, processPDF, generateZip, type StitchConfig, type ProcessingStatus } from './utils/pdfProcessor';
import { FileText, Loader2, AlertCircle, Languages } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import { useI18n, formatString } from './store/i18n';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [config, setConfig] = useState<StitchConfig>({
    splitCount: 9,
    direction: 'vertical',
    quality: 'high',
    gap: true,
    border: false
  });
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'done', progress: 0 });
  const [results, setResults] = useState<string[]>([]);
  const { t, lang, setLang } = useI18n();

  const isProcessing = status.step === 'rendering' || status.step === 'stitching' || status.step === 'zipping';

  // Load PDF when file changes
  useEffect(() => {
    if (file) {
      setStatus({ step: 'loading', progress: 0, message: t('loading') });
      loadPDF(file)
        .then(doc => {
          setPdfDoc(doc);
          setConfig(prev => ({ ...prev, splitCount: 9 })); // Reset split count
          setStatus({ step: 'done', progress: 0 });
        })
        .catch(err => {
          setStatus({ step: 'error', progress: 0, message: t('errorLoad') });
          console.error(err);
        });
    }
  }, [file]);

  const handleGenerate = async () => {
    if (pdfDoc) {
      try {
        const images = await processPDF(pdfDoc, config, setStatus);
        setResults(images);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Enter key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && file && !isProcessing) {
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, config, isProcessing]); // Re-bind when config changes so handleGenerate uses latest config

  const handleDownload = async () => {
    if (results.length === 0) return;
    
    try {
      setStatus({ step: 'zipping', progress: 0, message: t('zipping') });
      const zipBlob = await generateZip(results, file?.name.replace('.pdf', '') || 'stitched');
      saveAs(zipBlob, `${file?.name.replace('.pdf', '') || 'images'}-stitched.zip`);
      setStatus({ step: 'done', progress: 100 });
    } catch (err) {
      setStatus({ step: 'error', progress: 0, message: t('errorZip') });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col items-center relative">
          <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="absolute right-0 top-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            <Languages className="w-4 h-4" />
            {lang === 'en' ? '中文' : 'English'}
          </button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full">
            {!file ? (
              <UploadZone onFileSelect={setFile} className="flex-1" />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-sm" title={file.name}>{file.name}</h3>
                    <p className="text-xs text-gray-500">{formatString(t('totalPages'), { n: pdfDoc?.numPages || 0 })}</p>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setResults([]); setPdfDoc(null); }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    {t('changeFile')}
                  </button>
                </div>
              </div>
            )}

            {pdfDoc && (
              <Controls 
                config={config} 
                onChange={setConfig} 
                onGenerate={handleGenerate}
                totalPages={pdfDoc.numPages}
                disabled={isProcessing}
              />
            )}

            {/* Status Card */}
            {status.step !== 'done' && (
              <div className={`rounded-xl p-4 border ${
                status.step === 'error' 
                  ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
              }`}>
                <div className="flex items-center gap-3">
                  {status.step === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {status.message || t('processing')}
                    </p>
                    {status.progress > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-current transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-2 h-full min-h-[500px]">
            {results.length > 0 ? (
              <PreviewGallery images={results} onDownload={handleDownload} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 min-h-[500px]">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <FileText className="w-8 h-8 opacity-50" />
                </div>
                <p>{t('previewPlaceholder')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
