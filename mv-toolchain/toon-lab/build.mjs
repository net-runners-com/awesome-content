// esbuild でバンドル → index.html にインライン（Artifact は外部スクリプト不可のため）
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
execSync("../remotion-mv/node_modules/.bin/esbuild src/main.js --bundle --minify --format=iife --outfile=dist/bundle.js", { stdio: "inherit" });
const bundle = readFileSync("dist/bundle.js", "utf8");
const tpl = readFileSync("template.html", "utf8");
writeFileSync("index.html", tpl.replace("/*__BUNDLE__*/", () => bundle));
console.log("index.html written");
