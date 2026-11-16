import test from "node:test";
import assert from "node:assert/strict";
import {
  planGroups,
  dimensions,
  MAX_EDGE,
  MAX_PIXELS,
} from "../src/workspace/layout.ts";
const options = {
  width: 1080,
  perGroup: 12,
  gap: 20,
  direction: "vertical",
  format: "jpeg",
  trim: false,
};
test("preserves selected order and splits before canvas limits", () => {
  const sizes = Array.from({ length: 30 }, () => ({ width: 600, height: 900 }));
  const pages = [...Array(30)].map((_, i) => 30 - i);
  const groups = planGroups(pages, sizes, options);
  assert.deepEqual(groups.flat(), pages);
  for (const g of groups) {
    const d = dimensions(g, sizes, options);
    assert.ok(d.height <= MAX_EDGE);
    assert.ok(d.width * d.height <= MAX_PIXELS);
    assert.ok(g.length <= 12);
  }
});
test("respects horizontal pixel limits and excludes empty groups", () => {
  const sizes = Array.from({ length: 20 }, () => ({ width: 600, height: 800 }));
  const opts = { ...options, width: 2160, direction: "horizontal" };
  for (const g of planGroups(
    sizes.map((_, i) => i + 1),
    sizes,
    opts,
  )) {
    const d = dimensions(g, sizes, opts);
    assert.ok(d.width <= MAX_EDGE);
    assert.ok(d.width * d.height <= MAX_PIXELS);
  }
  assert.deepEqual(planGroups([], sizes, opts), []);
});
test("rejects a single pathological page before allocating its export canvas", () =>
  assert.throws(
    () => planGroups([1], [{ width: 10, height: 10000 }], options),
    /降低/,
  ));
