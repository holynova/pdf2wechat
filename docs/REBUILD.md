# 纸间 · PDF Studio v2

保留原仓库与 GitHub Pages 地址，将单次拼图重做为本地 PDF 工作台。

- 页面缩略图、勾选、拖动和键盘按钮排序。
- JPG / PNG、横向 / 纵向、750–2160 px、页间距和自动裁白边。
- 按每组页数、16,000 px 边长及 28 MP 工作画布上限自动拆图。
- 逐页绘制并释放 Canvas；Blob 成品、单张下载、ZIP 导出与取消。
- 不上传文档；最多导入 300 页；裁白边后最终尺寸以预览为准。

## 开发与验证

Node.js 24+。`npm ci`、`npm test`、`npm run build`、`npm run dev`。

`src/workspace/layout.ts` 负责纯布局；`engine.ts` 负责 PDF 解码、裁白边、导出和资源释放。

浏览器验收：四页混合横竖版 PDF，取消第二页、移动第四页后导出；裁白边与横排、ZIP、移动端布局另行检查。最终验收结果见 `VALIDATION.md`。
