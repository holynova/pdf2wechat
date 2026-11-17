import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Download,
  FilePlus2,
  FileText,
  Grip,
  Layers,
  Loader2,
  Scissors,
  X,
} from "lucide-react";
import {
  pdfjs,
  render,
  blobCanvas,
  exportGroups,
  zipResults,
  download,
  type Result,
} from "./workspace/engine";
import {
  dimensions,
  planGroups,
  type Options,
  type PageSize,
} from "./workspace/layout";
import "./App.css";
const defaults: Options = {
  width: 1080,
  perGroup: 3,
  gap: 20,
  direction: "vertical",
  format: "jpeg",
  trim: false,
};
export default function App() {
  const [doc, setDoc] = useState<pdfjs.PDFDocumentProxy | null>(null),
    [name, setName] = useState(""),
    [thumbs, setThumbs] = useState<string[]>([]),
    [sizes, setSizes] = useState<PageSize[]>([]),
    [order, setOrder] = useState<number[]>([]),
    [selected, setSelected] = useState<number[]>([]),
    [options, setOptions] = useState(defaults),
    [results, setResults] = useState<Result[]>([]),
    [busy, setBusy] = useState(""),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [view, setView] = useState<"pages" | "output">("pages"),
    [zoom, setZoom] = useState<Result | null>(null),
    [drag, setDrag] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null),
    abort = useRef<AbortController | null>(null),
    live = useRef({ doc, thumbs, results });
  live.current = { doc, thumbs, results };
  useEffect(
    () => () => {
      abort.current?.abort();
      live.current.doc?.destroy();
      live.current.thumbs.forEach(URL.revokeObjectURL);
      live.current.results.forEach((r) => URL.revokeObjectURL(r.url));
    },
    [],
  );
  useEffect(() => {
    if (!zoom) return;
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [zoom]);
  function clearResults() {
    setZoom(null);
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
    setView("pages");
  }
  function update(p: Partial<Options>) {
    setOptions((o) => ({ ...o, ...p }));
    clearResults();
  }
  async function open(file?: File) {
    if (!file || busy) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("请选择 PDF 文件。");
      return;
    }
    setBusy("正在读取文档");
    setError("");
    setProgress(0);
    clearResults();
    const controller = new AbortController();
    abort.current = controller;
    let next: pdfjs.PDFDocumentProxy | null = null;
    const urls: string[] = [];
    try {
      next = await pdfjs.getDocument({ data: await file.arrayBuffer() })
        .promise;
      if (next.numPages > 300)
        throw new Error("请先将文档拆成 300 页以内，再导入。");
      const list: PageSize[] = [];
      for (let n = 1; n <= next.numPages; n++) {
        const p = await next.getPage(n);
        const v = p.getViewport({ scale: 1 });
        list.push({ width: v.width, height: v.height });
        const c = await render(next, n, 180, controller.signal);
        urls.push(URL.createObjectURL(await blobCanvas(c, "image/jpeg")));
        c.width = c.height = 0;
        setProgress(Math.round((n / next.numPages) * 100));
      }
      await doc?.destroy();
      thumbs.forEach(URL.revokeObjectURL);
      setDoc(next);
      setName(file.name);
      setThumbs(urls);
      setSizes(list);
      const pages = list.map((_, i) => i + 1);
      setOrder(pages);
      setSelected(pages);
    } catch (e) {
      urls.forEach(URL.revokeObjectURL);
      await next?.destroy();
      setError(
        controller.signal.aborted
          ? "已取消读取。"
          : e instanceof Error
            ? (e.name === "PasswordException" ? "这份 PDF 需要密码，请先解锁后再导入。" : e.name === "InvalidPDFException" ? "无法读取这份 PDF，请检查文件是否完整。" : e.message)
            : "读取失败。",
      );
    } finally {
      setBusy("");
      abort.current = null;
      if (input.current) input.current.value = "";
    }
  }
  const chosen = order.filter((n) => selected.includes(n));
  let groups: number[][] = [],
    planError = "";
  try {
    groups = planGroups(chosen, sizes, options);
  } catch (e) {
    planError = (e as Error).message;
  }
  function toggle(n: number) {
    clearResults();
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  }
  function move(n: number, delta: number) {
    const i = order.indexOf(n),
      j = i + delta;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    clearResults();
  }
  async function generate() {
    if (!doc || !groups.length) return;
    setBusy("正在生成图片");
    setError("");
    setProgress(0);
    clearResults();
    const controller = new AbortController();
    abort.current = controller;
    try {
      setResults(
        await exportGroups(
          doc,
          groups,
          sizes,
          options,
          controller.signal,
          setProgress,
        ),
      );
      setView("output");
    } catch (e) {
      setError(
        controller.signal.aborted
          ? "已取消生成，可以调整后重试。"
          : (e as Error).message,
      );
    } finally {
      setBusy("");
      abort.current = null;
    }
  }
  async function zip() {
    setBusy("正在打包");
    try {
      download(
        await zipResults(results, options.format),
        name.replace(/\.pdf$/i, "") + "-images.zip",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./">
          <span className="brand-icon">
            <Layers size={21} />
          </span>
          纸间 <span className="brand-en">PDF 图片工作台</span>
        </a>
        <div className="toplinks">
          <span className="local-dot">文件仅在本机处理</span>
          <a
            href="https://github.com/holynova/pdf2wechat"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={14} />
          </a>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">选择页面，编排成图</div>
            <h1>
              把一份文档，
              <br className="mobile-break" />
              变成值得分享的图片。
            </h1>
            <p>挑选页面、安排顺序，把 PDF 拼成长图或一组清晰的卡片。</p>
          </div>
          <div className="edition">
            01 — 选择
            <br />
            02 — 编排
            <br />
            03 — 导出
          </div>
        </section>
        <div className="workspace">
          <aside className="settings">
            <div className="section-label">文档</div>
            <input
              ref={input}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => open(e.target.files?.[0])}
            />
            <button
              className="upload"
              disabled={!!busy}
              onClick={() => input.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                open(e.dataTransfer.files[0]);
              }}
            >
              <FilePlus2 size={25} />
              <strong>{name || "选择或拖入 PDF"}</strong>
              <span>
                {doc
                  ? `${doc.numPages} 页 · 点击更换文档`
                  : "本地处理，无需注册"}
              </span>
            </button>
            <fieldset disabled={!!busy}>
              <div className="section-label spaced">输出设置</div>
              <label>
                排列方向
                <div className="segmented">
                  <button
                    type="button"
                    className={options.direction === "vertical" ? "active" : ""}
                    onClick={() => update({ direction: "vertical" })}
                  >
                    纵向长图
                  </button>
                  <button
                    type="button"
                    className={
                      options.direction === "horizontal" ? "active" : ""
                    }
                    onClick={() => update({ direction: "horizontal" })}
                  >
                    横向拼接
                  </button>
                </div>
              </label>
              <label>
                单页输出宽度
                <select
                  value={options.width}
                  onChange={(e) => update({ width: +e.target.value })}
                >
                  <option value={750}>750 px · 轻量分享</option>
                  <option value={1080}>1080 px · 日常高清</option>
                  <option value={1600}>1600 px · 精细阅读</option>
                  <option value={2160}>2160 px · 超清存档</option>
                </select>
              </label>
              <label>
                每张最多页数 <b>{options.perGroup} 页</b>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={options.perGroup}
                  onChange={(e) => update({ perGroup: +e.target.value })}
                />
              </label>
              <label>
                页间留白
                <select
                  value={options.gap}
                  onChange={(e) => update({ gap: +e.target.value })}
                >
                  <option value={0}>无间距</option>
                  <option value={20}>20 px · 紧凑</option>
                  <option value={48}>48 px · 宽松</option>
                </select>
              </label>
              <label className="check-label">
                <span>
                  <Scissors size={16} />
                  自动裁掉白边
                </span>
                <input
                  type="checkbox"
                  checked={options.trim}
                  onChange={(e) => update({ trim: e.target.checked })}
                />
              </label>
              <label>
                图片格式
                <select
                  value={options.format}
                  onChange={(e) =>
                    update({ format: e.target.value as Options["format"] })
                  }
                >
                  <option value="jpeg">JPG · 更小体积</option>
                  <option value="png">PNG · 无损清晰</option>
                </select>
              </label>
            </fieldset>
            <div className="export-summary">
              <strong>{groups.length.toString().padStart(2, "0")}</strong>
              <span>
                预计生成图片
                <br />
                <small>{chosen.length} 页已选 · 超长图片自动分组</small>
              </span>
            </div>
            <button
              className="primary"
              disabled={!doc || !!busy || !chosen.length || !!planError}
              onClick={generate}
            >
              <Layers size={17} />
              生成图片 <span>→</span>
            </button>
            <p className="aside-note">
              预览与下载均不上传文件。关闭页面后，本次文档自动释放。
            </p>
          </aside>
          <section className="canvas-area">
            <div className="canvas-toolbar">
              <div className="tabs">
                <button
                  className={view === "pages" ? "current" : ""}
                  onClick={() => setView("pages")}
                >
                  页面编排 <span>{doc?.numPages || 0}</span>
                </button>
                <button
                  className={view === "output" ? "current" : ""}
                  disabled={!results.length}
                  onClick={() => setView("output")}
                >
                  导出预览 <span>{results.length}</span>
                </button>
              </div>
              {doc && view === "pages" && (
                <button
                  disabled={!!busy}
                  className="text-button"
                  onClick={() => {
                    setSelected(
                      selected.length === order.length ? [] : [...order],
                    );
                    clearResults();
                  }}
                >
                  {selected.length === order.length ? "取消全选" : "全选"}
                </button>
              )}
              {results.length > 0 && view === "output" && (
                <button disabled={!!busy} className="text-button" onClick={zip}>
                  <Download size={15} />
                  下载全部 ZIP
                </button>
              )}
            </div>
            {(error || planError) && (
              <div role="alert" className="message error">
                {error || planError}
                <button disabled={!error} onClick={() => setError("")} aria-label="关闭提示">
                  <X size={16} />
                </button>
              </div>
            )}
            {busy && (
              <div className="progress" role="status">
                <div>
                  <Loader2 className="spin" size={16} />
                  {busy}{abort.current ? ` ${progress}%` : "…"}
                  {abort.current && (
                    <button onClick={() => abort.current?.abort()}>取消</button>
                  )}
                </div>
                <progress max={100} value={abort.current ? progress : undefined} />
              </div>
            )}
            {!doc && !busy ? (
              <div className="empty">
                <div className="paper-demo">
                  <div className="demo-paper back" />
                  <div className="demo-paper front">
                    <span>文档摘录</span>
                    <h2>
                      留住
                      <br />
                      纸上的灵感。
                    </h2>
                    <div className="paper-art" />
                    <i />
                    <i />
                    <i />
                  </div>
                  <span className="paper-tag">
                    <Check size={13} /> 准备好分享
                  </span>
                </div>
                <h2>从一份 PDF 开始</h2>
                <p>
                  讲义、作品集、阅读摘录……
                  <br />
                  让每一页，都有更合适的分享方式。
                </p>
                <button
                  className="text-button"
                  onClick={() => input.current?.click()}
                >
                  选择你的第一份文档 →
                </button>
              </div>
            ) : view === "pages" ? (
              <>
                <div className="board-caption">
                  <span>
                    <Grip size={14} />
                    拖动调整顺序，或使用页面下方的箭头
                  </span>
                  <span>
                    {chosen.length} / {order.length} 页已选
                  </span>
                </div>
                <div className="page-grid">
                  {order.map((n) => (
                    <article
                      className={`page-card ${selected.includes(n) ? "selected" : ""}`}
                      key={n}
                      draggable={!busy}
                      onDragStart={() => setDrag(n)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (drag !== null && drag !== n && !busy) {
                          const a = order.filter((x) => x !== drag);
                          a.splice(a.indexOf(n), 0, drag);
                          setOrder(a);
                          clearResults();
                        }
                        setDrag(null);
                      }}
                    >
                      <button
                        className="page-image"
                        disabled={!!busy}
                        onClick={() => toggle(n)}
                        aria-label={`${selected.includes(n) ? "取消选择" : "选择"}第 ${n} 页`}
                        aria-pressed={selected.includes(n)}
                      >
                        <img src={thumbs[n - 1]} alt={`第 ${n} 页缩略图`} />
                        <span className="selection">
                          {selected.includes(n) && <Check size={13} />}
                        </span>
                      </button>
                      <div className="page-meta">
                        <span>第 {n} 页</span>
                        <div>
                          <button
                            disabled={!!busy || order.indexOf(n) === 0}
                            onClick={() => move(n, -1)}
                            aria-label={`第 ${n} 页前移`}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            disabled={
                              !!busy || order.indexOf(n) === order.length - 1
                            }
                            onClick={() => move(n, 1)}
                            aria-label={`第 ${n} 页后移`}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {groups.length > 0 && (
                  <div className="group-strip">
                    <div className="section-label">
                      分组预览 ·{" "}
                      {options.trim ? "裁白边后的尺寸以成品为准" : "预计尺寸"}
                    </div>
                    {groups.map((g, i) => {
                      const d = dimensions(g, sizes, options);
                      return (
                        <div key={i}>
                          <FileText size={14} />
                          <b>{String(i + 1).padStart(2, "0")}</b>
                          <span>第 {g.join("、")} 页</span>
                          <small>
                            {d.width.toLocaleString()} × {d.height.toLocaleString()} px
                          </small>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="result-grid">
                {results.map((r, i) => (
                  <article key={r.url}>
                    <button className="result-image" onClick={() => setZoom(r)}>
                      <img src={r.url} alt={`导出图片 ${i + 1}`} />
                    </button>
                    <div className="result-info">
                      <div>
                        <strong>图片 {String(i + 1).padStart(2, "0")}</strong>
                        <small>
                          {r.width.toLocaleString()} × {r.height.toLocaleString()} px，{" "}
                          {(r.blob.size / 1024 / 1024).toFixed(2)} MiB
                        </small>
                      </div>
                      <button
                        aria-label={`下载图片 ${i + 1}`}
                        onClick={() =>
                          download(
                            r.blob,
                            `${name.replace(/\.pdf$/i, "")}-${i + 1}.${options.format}`,
                          )
                        }
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        <footer>
          纸间 · PDF Studio <span>好内容，值得被看见。</span>
        </footer>
      </main>
      {zoom && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="图片大图"
          onClick={() => setZoom(null)}
        >
          <button autoFocus aria-label="关闭大图" onClick={() => setZoom(null)}>
            <X />
          </button>
          <img
            src={zoom.url}
            alt="导出大图预览"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
