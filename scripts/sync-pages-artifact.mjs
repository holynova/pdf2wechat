import { cp, rm, writeFile } from "node:fs/promises";

await rm("docs", { recursive: true, force: true });
await cp("dist", "docs", { recursive: true });
await writeFile("docs/.nojekyll", "", "utf8");
console.log("Copied the Pages build from dist/ to docs/.");
