// bluebell.html →
//   bluebell.built.html    : 草バンドルを注入（画像はファイル参照、ローカル確認用）
//   bluebell.artifact.html : 草バンドル＋画像をdata URIでインライン（公開用）
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

// grass-src.js を IIFE にバンドル（three.js 同梱）。window.__grass に公開。
execSync('node_modules/.bin/esbuild grass-src.js --bundle --format=iife --global-name=__grass --minify --outfile=dist-grass.js', { stdio: 'inherit' });
const bundle = readFileSync('dist-grass.js', 'utf8');

const src = readFileSync('bluebell.html', 'utf8');
const withBundle = src.replace('/*__GRASS_BUNDLE__*/', () => bundle);
writeFileSync('bluebell.built.html', withBundle);
console.log(`bluebell.built.html: ${(withBundle.length / 1024 / 1024).toFixed(2)} MB`);

const uri = (p, m) => `data:${m};base64,${readFileSync(p).toString('base64')}`;
const MAP = {
  'img-bluebell/bg.png': uri('img-bluebell/bg-web.jpg', 'image/jpeg'),
  'img-bluebell/trunks.png': uri('img-bluebell/trunks-web.png', 'image/png'),
};
let art = withBundle;
for (const [k, v] of Object.entries(MAP)) art = art.split(k).join(v);
writeFileSync('bluebell.artifact.html', art);
console.log(`bluebell.artifact.html: ${(art.length / 1024 / 1024).toFixed(2)} MB`);
