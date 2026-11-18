<p align="right"><a href="README.en.md">English</a></p>

<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="纸间 PDF Studio — 三页文档叠放，箭头指向一条拼好的长图，长图里是橙蓝绿三段页面">
</p>

<p align="center">
  <a href="https://xiaosang.cc/pdf2wechat/">▶ 在线体验</a>
  ·
  <a href="https://github.com/holynova/pdf2wechat">GitHub 仓库</a>
</p>

纸间 PDF Studio（pdf2wechat）是一个纯前端 PDF 转长图工具：在浏览器本地选页、排序、裁白边，把 PDF 拼成长图或一组清晰的卡片，方便分享到微信等社交平台。文件不上传服务器，全程本地处理。

## 截图

<p align="center">
  <img src="./assets/readme/screenshot-v2-loaded.png" width="640" alt="v2 工作台：已导入 3 页 PDF，页面缩略图可勾选与拖动排序，左侧输出设置，分组预览 1080 × 4624">
  <img src="./assets/readme/screenshot-v2-output.png" width="640" alt="导出预览：3 页拼成 1 张长图图片 01（1080 × 4624，0.07 MB），可单张下载或下载全部 ZIP">
</p>

## 使用

1. **选择**：导入 PDF（最多 300 页），页面缩略图逐页呈现。
2. **编排**：勾选需要的页面，拖动或用箭头按钮调整顺序；不需要的页面取消选择。
3. **导出**：设置输出选项，点「生成图片」，预览后单张下载或打包 ZIP 下载。

## 输出选项

| 选项 | 可选值 | 默认 |
|---|---|---|
| 排列方向 | 纵向长图 / 横向拼接 | 纵向长图 |
| 单页输出宽度 | 750 / 1080 / 1600 / 2160 px | 1080 px |
| 每张最多页数 | 自由输入（滑杆） | 3 页 |
| 页间留白 | 无间距 / 20 px 紧凑 / 48 px 宽松 | 20 px |
| 自动裁白边 | 开 / 关 | 关 |
| 图片格式 | JPG（更小体积）/ PNG（无损清晰） | JPG |

分组按每张页数与画布上限自动拆分：单边最长 16,000 px、总像素不超过 28 MP，超限自动另起一张。裁白边后最终尺寸以预览为准。生成过程可随时取消；逐页绘制并释放 Canvas，避免大文档内存暴涨。

实测（本地构建）：3 页测试 PDF，默认设置生成 1 张 1080 × 4624 JPG（0.07 MB）。

## 技术

- React 19 + Vite + TypeScript + Tailwind CSS 4；PDF 解码用 `pdfjs-dist`（Worker 本地打包，不依赖 CDN）。
- 布局纯函数在 `src/workspace/layout.ts`（分组规划、尺寸计算、画布上限）；`src/workspace/engine.ts` 负责 PDF 解码、裁白边、导出与资源释放。
- 打包下载用 `jszip` + `file-saver`；状态用 `zustand`。
- 旧版组件（`src/components/`、`src/utils/pdfProcessor.ts`）与旧版截图（`snap_cn.png` / `snap_en.png`）属于 v1 界面，当前 `App.tsx` 是 v2 工作台（见 `docs/REBUILD.md`）。

```
index.html                  入口（标题：纸间 · PDF 分享图片工作台）
src/App.tsx                 v2 工作台：选页 / 排序 / 输出设置 / 导出预览
src/workspace/layout.ts     纯布局：分组规划、尺寸、画布上限
src/workspace/engine.ts     PDF 解码、裁白边、导出、ZIP、资源释放
src/store/i18n.ts           中英双语文案
src/components/             v1 旧版组件（当前未使用）
src/utils/pdfProcessor.ts   v1 旧版处理逻辑（当前未使用）
tests/layout.test.mjs       布局测试（3 个用例）
docs/REBUILD.md             v2 重做说明
docs/VALIDATION.md          验收记录（2026-11-16）
```

## 本地运行与测试

```bash
npm install
npm run dev      # Vite 开发服务器
npm run build    # tsc + vite build，产物输出至 dist/
npm test         # node --test，布局测试 3 个用例（本地实跑 3 通过）
```
