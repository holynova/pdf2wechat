import * as pdfjs from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { dimensions, type Options, type PageSize } from "./layout";
pdfjs.GlobalWorkerOptions.workerSrc = worker;
export { pdfjs };
export type Result = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  pages: number[];
};
export function check(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("已取消", "AbortError");
}
export function blobCanvas(
  canvas: HTMLCanvasElement,
  format = "image/png",
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("图像导出失败，请降低宽度。"))),
      format,
      0.9,
    ),
  );
}
export async function render(
  doc: pdfjs.PDFDocumentProxy,
  n: number,
  width: number,
  signal: AbortSignal,
) {
  check(signal);
  const page = await doc.getPage(n);
  check(signal);
  const viewport = page.getViewport({
    scale: width / page.getViewport({ scale: 1 }).width,
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const task = page.render({ canvas, viewport });
  const cancel = () => task.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    await task.promise;
    check(signal);
    return canvas;
  } catch (e) {
    canvas.width = canvas.height = 0;
    throw e;
  } finally {
    signal.removeEventListener("abort", cancel);
    page.cleanup();
  }
}
function bounds(c: HTMLCanvasElement) {
  // Scan a small copy; retain 8 px of breathing room around detected content.
  const sample = document.createElement("canvas");
  const ratio = Math.min(1, 400 / c.width);
  sample.width = Math.max(1, Math.round(c.width * ratio));
  sample.height = Math.max(1, Math.round(c.height * ratio));
  const ctx = sample.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(c, 0, 0, sample.width, sample.height);
  const { data } = ctx.getImageData(0, 0, sample.width, sample.height);
  let left = sample.width,
    top = sample.height,
    right = -1,
    bottom = -1;
  for (let y = 0; y < sample.height; y++)
    for (let x = 0; x < sample.width; x++) {
      const i = (y * sample.width + x) * 4;
      if (
        data[i + 3] > 20 &&
        Math.min(data[i], data[i + 1], data[i + 2]) < 240
      ) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  sample.width = sample.height = 0;
  if (right < 0) return { x: 0, y: 0, w: c.width, h: c.height };
  const x = Math.max(0, Math.floor(left / ratio) - 8),
    y = Math.max(0, Math.floor(top / ratio) - 8);
  return {
    x,
    y,
    w: Math.min(c.width, Math.ceil((right + 1) / ratio) + 8) - x,
    h: Math.min(c.height, Math.ceil((bottom + 1) / ratio) + 8) - y,
  };
}
export async function exportGroups(
  doc: pdfjs.PDFDocumentProxy,
  groups: number[][],
  sizes: PageSize[],
  options: Options,
  signal: AbortSignal,
  progress: (n: number) => void,
): Promise<Result[]> {
  const output: Result[] = [];
  let completed = 0;
  const total = groups.reduce((n, g) => n + g.length, 0);
  try {
    for (const pages of groups) {
      check(signal);
      const d = dimensions(pages, sizes, options);
      const sheet = document.createElement("canvas");
      sheet.width = d.width;
      sheet.height = d.height;
      const ctx = sheet.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, d.width, d.height);
      let cursor = 0,
        cross = 0;
      try {
        for (const n of pages) {
          const c = await render(doc, n, options.width, signal);
          const b = options.trim
            ? bounds(c)
            : { x: 0, y: 0, w: c.width, h: c.height };
          if (options.direction === "vertical") {
            ctx.drawImage(
              c,
              b.x,
              b.y,
              b.w,
              b.h,
              Math.round((d.width - b.w) / 2),
              cursor,
              b.w,
              b.h,
            );
            cursor += b.h + options.gap;
            cross = d.width;
          } else {
            ctx.drawImage(c, b.x, b.y, b.w, b.h, cursor, 0, b.w, b.h);
            cursor += b.w + options.gap;
            cross = Math.max(cross, b.h);
          }
          c.width = c.height = 0;
          progress(Math.round((++completed / total) * 95));
          await new Promise((r) => setTimeout(r, 0));
        }
        check(signal);
        const width =
          options.direction === "vertical" ? cross : cursor - options.gap;
        const height =
          options.direction === "vertical" ? cursor - options.gap : cross;
        let final = sheet;
        if (width !== d.width || height !== d.height) {
          final = document.createElement("canvas");
          final.width = width;
          final.height = height;
          final.getContext("2d")!.drawImage(sheet, 0, 0);
          sheet.width = sheet.height = 0;
        }
        const blob = await blobCanvas(final, "image/" + options.format);
        final.width = final.height = 0;
        check(signal);
        output.push({
          blob,
          url: URL.createObjectURL(blob),
          width,
          height,
          pages,
        });
      } finally {
        sheet.width = sheet.height = 0;
      }
    }
    progress(100);
    return output;
  } catch (e) {
    output.forEach((r) => URL.revokeObjectURL(r.url));
    throw e;
  }
}
export async function zipResults(results: Result[], format: string) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  results.forEach((r, i) =>
    zip.file(
      `${String(i + 1).padStart(2, "0")}-pages-${r.pages.join("-")}.${format}`,
      r.blob,
    ),
  );
  return zip.generateAsync({ type: "blob" });
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
