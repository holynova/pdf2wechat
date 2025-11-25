import { create } from 'zustand';

type Language = 'en' | 'zh';

interface I18nStore {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const translations = {
  en: {
    title: 'PDF Stitcher',
    subtitle: 'Convert PDF pages into stitched long images entirely in your browser',
    uploadTitle: 'Upload PDF File',
    uploadDesc: 'Drag and drop or click to browse',
    uploadSupport: 'Supports PDF files only',
    changeFile: 'Change',
    configTitle: 'Configuration',
    splitCount: 'Split into N Images',
    totalPages: 'Total pages',
    willGenerate: 'Will generate {n} images, approx {p} pages each.',
    stitchingOptions: 'Stitching Options',
    addGap: 'Add Gap',
    addBorder: 'Add Border',
    direction: 'Stitching Direction',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    quality: 'Output Quality',
    highQuality: 'High Quality',
    highQualityDesc: 'PNG Format',
    normalQuality: 'Normal',
    normalQualityDesc: 'JPG Format',
    startConversion: 'Start Conversion',
    previewTitle: 'Preview',
    downloadAll: 'Download All',
    previewPlaceholder: 'Upload a PDF to see the preview here',
    loading: 'Loading PDF...',
    processing: 'Processing...',
    zipping: 'Creating ZIP file...',
    errorLoad: 'Failed to load PDF. Please try another file.',
    errorZip: 'Failed to create ZIP file.',
    moreImages: '... and {n} more images. Download to view all.',
    part: 'Part',
  },
  zh: {
    title: 'PDF 拼图工具',
    subtitle: '纯前端运行，安全快速将 PDF 转换为长图',
    uploadTitle: '上传 PDF 文件',
    uploadDesc: '拖拽文件到此处或点击上传',
    uploadSupport: '仅支持 PDF 文件',
    changeFile: '更换文件',
    configTitle: '设置',
    splitCount: '切分为 N 张图片',
    totalPages: '共 {n} 页',
    willGenerate: '将生成 {n} 张图片，每张约 {p} 页',
    stitchingOptions: '拼接选项',
    addGap: '增加间距',
    addBorder: '增加边框',
    direction: '拼接方向',
    vertical: '垂直拼接',
    horizontal: '水平拼接',
    quality: '输出质量',
    highQuality: '高质量',
    highQualityDesc: 'PNG 格式',
    normalQuality: '普通',
    normalQualityDesc: 'JPG 格式',
    startConversion: '开始转换',
    previewTitle: '预览',
    downloadAll: '打包下载',
    previewPlaceholder: '上传 PDF 后在此处预览',
    loading: '加载 PDF 中...',
    processing: '处理中...',
    zipping: '打包中...',
    errorLoad: '加载 PDF 失败，请重试',
    errorZip: '创建压缩包失败',
    moreImages: '... 还有 {n} 张图片，请下载查看全部',
    part: '第 {n} 部分',
  }
};

export const useI18n = create<I18nStore>((set, get) => ({
  lang: 'zh', // Default to Chinese as per request context implies Chinese user
  setLang: (lang) => set({ lang }),
  t: (key) => {
    const lang = get().lang;
    return translations[lang][key] || key;
  }
}));

export const formatString = (str: string, args: Record<string, string | number>) => {
  return str.replace(/{(\w+)}/g, (_, key) => String(args[key] || ''));
};
