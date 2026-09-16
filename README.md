# PDF Stitcher / PDF 拼图工具


![Screenshot](./screenshot.png)


**Pure Frontend PDF to Long Image Converter**
**纯前端 PDF 转长图工具**

[在线使用 / Live demo](https://holynova.github.io/pdf2wechat/)

## 🇨🇳 中文介绍

无需上传文件到服务器，完全在浏览器本地运行，安全快速。

**第一次使用：** 选择 PDF → 调整切分数量与拼接方向 → 预览 → 下载图片或 ZIP。

**核心功能：**
- 🖼️ **智能拼接**：自定义切分数量，支持垂直/水平拼接
- 🎨 **样式调整**：支持添加间距和边框
- ⚡ **即时预览**：所见即所得，支持点击查看大图
- 📦 **一键打包**：生成高清图片并打包下载

![界面预览](snap_cn.png)

---

## 🇺🇸 English Introduction

Secure and fast PDF to long image converter running entirely in your browser. No server upload required.

**Key Features:**
- 🖼️ **Smart Stitching**: Custom split count, vertical/horizontal stitching
- 🎨 **Style Options**: Adjustable gaps and borders
- ⚡ **Instant Preview**: Real-time preview with zoom capability
- 📦 **Batch Export**: Generate high-quality images and download as ZIP

![Interface Preview](snap_en.png)
## 本地开发 / Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开终端输出的本地地址。构建和检查使用：

```bash
pnpm lint
pnpm build
pnpm preview
```

较大的 PDF 与高分辨率长图会占用更多浏览器内存，可先用少量页面确认预览效果。
