// 公式SDKビューア(dist)を単一HTMLに固める → ren-viewer.artifact.html
// Core / バンドル / モデル一式(Ren + Hiyori) / シェーダーを base64 の仮想FSに埋め、
// fetch と Image.src をフックして相対パス → 埋め込みデータに解決する。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const DIST = 'Samples/TypeScript/Demo/dist';
const VFS = {};
const MIME = { '.png': 'image/png', '.json': 'application/json', '.moc3': 'application/octet-stream', '.frag': 'text/plain', '.vert': 'text/plain' };

function addFile(absPath, key) {
  VFS[key.toLowerCase()] = readFileSync(absPath).toString('base64');
}
function addDir(dir, { skip = [] } = {}) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (skip.some((s) => p.includes(s))) continue;
    if (statSync(p).isDirectory()) addDir(p, { skip });
    else if (MIME[extname(name)]) addFile(p, relative(DIST, p));
  }
}

// Ren: 4096テクスチャは飛ばし、model3.jsonが参照する ren.4096/ を 2048版で肩代わり
addDir(join(DIST, 'Resources/Ren'), { skip: ['ren.4096', 'Ren.4096'] });
addFile(join(DIST, 'Resources/Ren/Ren.2048/texture_00.png'), 'Resources/Ren/ren.4096/texture_00.png');
// Hiyori: テクスチャは1024に縮小した物へ差し替え
addDir(join(DIST, 'Resources/Hiyori'), { skip: ['Hiyori.2048'] });
addFile('artifact-tmp/hiyori1024/texture_00.png', 'Resources/Hiyori/Hiyori.2048/texture_00.png');
addFile('artifact-tmp/hiyori1024/texture_01.png', 'Resources/Hiyori/Hiyori.2048/texture_01.png');
addFile(join(DIST, 'Resources/back_class_normal.png'), 'Resources/back_class_normal.png');
addFile(join(DIST, 'Resources/icon_gear.png'), 'Resources/icon_gear.png');
addDir(join(DIST, 'Framework/Shaders'));

const core = readFileSync(join(DIST, 'Core/live2dcubismcore.min.js'), 'utf8');
const bundleName = readdirSync(join(DIST, 'assets')).find((f) => f.endsWith('.js'));
let bundle = readFileSync(join(DIST, 'assets', bundleName), 'utf8');
// モデル切替リストを埋め込んだ2体に限定
const before = bundle.length;
bundle = bundle.replace(/\[`Ren`,`Hiyori`,`Mao`,`Natori`\]/, '[`Ren`,`Hiyori`]');
if (bundle.length === before) throw new Error('ModelDir 配列が見つからない（バンドルの形が変わった）');
bundle = bundle.replace(/<\/script/gi, '<\\/script');

const shim = `
const VFS = ${JSON.stringify(VFS)};
const MIME = ${JSON.stringify(MIME)};
const key = (u) => { const m = String(u).match(/(Resources|Framework)\\/.*/i); return m ? m[0].toLowerCase() : null; };
const mime = (k) => MIME[k.slice(k.lastIndexOf('.'))] || 'application/octet-stream';
const bytes = (b64) => { const s = atob(b64); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; };
const _fetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const k = key(typeof input === 'string' ? input : input?.url);
  if (k && VFS[k]) return Promise.resolve(new Response(bytes(VFS[k]), { status: 200, headers: { 'Content-Type': mime(k) } }));
  if (k) return Promise.resolve(new Response('', { status: 404 }));
  return _fetch(input, init);
};
const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
Object.defineProperty(HTMLImageElement.prototype, 'src', {
  configurable: true,
  get() { return d.get.call(this); },
  set(v) { const k = key(v); d.set.call(this, k && VFS[k] ? 'data:' + mime(k) + ';base64,' + VFS[k] : v); },
});
`;

const html = `<meta charset="utf-8">
<title>Ren Live2D</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #1a1d24; overscroll-behavior-x: none; touch-action: none; }
  body > canvas { display: block; width: 100vw !important; height: 100vh !important; }
  .hud { position: fixed; left: 16px; bottom: 14px; z-index: 10; pointer-events: none; font: 500 11px/1.7 "DM Mono", ui-monospace, monospace; letter-spacing: .08em; color: #e8ebf2; text-shadow: 0 1px 6px rgba(0,0,0,.7); }
  .hud b { color: #ffd166; font-weight: 500; }
</style>
<div class="hud"><b>DRAG</b> 視線追従 · <b>TAP</b> 顔=表情 / 体=モーション · <b>⚙</b> 右上でモデル切替（Ren / Hiyori）<br>Live2D Cubism SDK for Web (Core 6.0.1) · 単一HTML・全部埋め込み</div>
<script>${core}</script>
<script>${shim}</script>
<script type="module">${bundle}</script>
`;
writeFileSync('ren-viewer.artifact.html', html);
console.log(`ren-viewer.artifact.html: ${(html.length / 1024 / 1024).toFixed(2)} MB, files: ${Object.keys(VFS).length}`);
