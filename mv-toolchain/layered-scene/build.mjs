// shinkai.html（img/*.jpg 参照）→ shinkai.artifact.html（data URI 埋め込み、Artifact公開用）
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
let html = readFileSync("shinkai.html", "utf8");
for (const f of readdirSync("img")) {
  if (!f.endsWith(".jpg")) continue;
  const b64 = readFileSync(`img/${f}`).toString("base64");
  html = html.split(`img/${f}`).join(`data:image/jpeg;base64,${b64}`);
}
writeFileSync("shinkai.artifact.html", html);
console.log("shinkai.artifact.html", (html.length / 1024 / 1024).toFixed(2), "MB");
