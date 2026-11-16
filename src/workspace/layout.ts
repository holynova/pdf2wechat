export interface PageSize {
  width: number;
  height: number;
}
export interface Options {
  width: number;
  perGroup: number;
  gap: number;
  direction: "vertical" | "horizontal";
  format: "png" | "jpeg";
  trim: boolean;
}
export const MAX_EDGE = 16000;
export const MAX_PIXELS = 28_000_000;
export function planGroups(
  pages: number[],
  sizes: PageSize[],
  options: Options,
) {
  const groups: number[][] = [];
  let group: number[] = [];
  for (const page of pages) {
    const candidate = [...group, page];
    const d = dimensions(candidate, sizes, options);
    if (
      group.length &&
      (candidate.length > options.perGroup ||
        d.width > MAX_EDGE ||
        d.height > MAX_EDGE ||
        d.width * d.height > MAX_PIXELS)
    ) {
      groups.push(group);
      group = [page];
    } else group = candidate;
    const single = dimensions(group, sizes, options);
    if (
      single.width > MAX_EDGE ||
      single.height > MAX_EDGE ||
      single.width * single.height > MAX_PIXELS
    )
      throw new Error("页面比例过长，请降低导出宽度。");
  }
  if (group.length) groups.push(group);
  return groups;
}
export function dimensions(
  pages: number[],
  sizes: PageSize[],
  options: Options,
) {
  const dims = pages.map((p) => {
    const s = sizes[p - 1];
    return {
      width: options.width,
      height: Math.round((options.width * s.height) / s.width),
    };
  });
  return options.direction === "vertical"
    ? {
        width: options.width,
        height:
          dims.reduce((a, s) => a + s.height, 0) +
          options.gap * Math.max(0, dims.length - 1),
      }
    : {
        width:
          dims.length * options.width +
          options.gap * Math.max(0, dims.length - 1),
        height: Math.max(1, ...dims.map((s) => s.height)),
      };
}
