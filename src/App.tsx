import { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { Controls } from './components/Controls';
import { PreviewGallery } from './components/PreviewGallery';
import { loadPDF, processPDF, generateZip, type StitchConfig, type ProcessingStatus } from './utils/pdfProcessor';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [config, setConfig] = useState<StitchConfig>({
    splitCount: 1,
    direction: 'vertical',
    quality: 'high'
  });
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'done', progress: 0 });
  const [results, setResults] = useState<string[]>([]);

  // Load PDF when file changes
  useEffect(() => {
    if (file) {
      setStatus({ step: 'loading', progress: 0, message: 'Loading PDF...' });
      loadPDF(file)
        .then(doc => {
          setPdfDoc(doc);
          setConfig(prev => ({ ...prev, splitCount: 1 })); // Reset split count
          setStatus({ step: 'done', progress: 0 });
        })
        .catch(err => {
          setStatus({ step: 'error', progress: 0, message: 'Failed to load PDF. Please try another file.' });
          console.error(err);
        });
    }
  }, [file]);

  // Process PDF when config changes or PDF is loaded
  useEffect(() => {
    if (pdfDoc && status.step !== 'rendering' && status.step !== 'stitching') {
      const runProcessing = async () => {
        try {
          const images = await processPDF(pdfDoc, config, setStatus);
          setResults(images);
        } catch (err) {
          console.error(err);
        }
      };
      
      // Debounce processing to avoid rapid re-renders on slider change
      const timer = setTimeout(runProcessing, 500);
      return () => clearTimeout(timer);
    }
  }, [pdfDoc, config.splitCount, config.direction, config.quality]);

  const handleDownload = async () => {
    if (results.length === 0) return;
    
    try {
      setStatus({ step: 'zipping', progress: 0, message: 'Creating ZIP file...' });
      const zipBlob = await generateZip(results, file?.name.replace('.pdf', '') || 'stitched');
      saveAs(zipBlob, `${file?.name.replace('.pdf', '') || 'images'}-stitched.zip`);
      setStatus({ step: 'done', progress: 100 });
    } catch (err) {
      setStatus({ step: 'error', progress: 0, message: 'Failed to create ZIP file.' });
    }
  };

  const isProcessing = status.step === 'rendering' || status.step === 'stitching' || status.step === 'zipping';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PDF Stitcher
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Convert PDF pages into stitched long images entirely in your browser
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {!file ? (
              <UploadZone onFileSelect={setFile} className="h-64" />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" title={file.name}>{file.name}</h3>
                    <p className="text-sm text-gray-500">{pdfDoc?.numPages || 0} pages</p>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setResults([]); setPdfDoc(null); }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {pdfDoc && (
              <Controls 
                config={config} 
                onChange={setConfig} 
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
                      {status.message || 'Processing...'}
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
          <div className="lg:col-span-2">
            {results.length > 0 ? (
              <PreviewGallery images={results} onDownload={handleDownload} />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <FileText className="w-8 h-8 opacity-50" />
                </div>
                <p>Upload a PDF to see the preview here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
