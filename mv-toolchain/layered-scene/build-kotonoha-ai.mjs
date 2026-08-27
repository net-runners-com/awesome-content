// kotonoha-ai.html → kotonoha-ai.artifact.html（AI生成画像をdata URIでインライン化）
import { readFileSync, writeFileSync } from 'node:fs';

const uri = (p, mime) => `data:${mime};base64,${readFileSync(p).toString('base64')}`;

const MAP = {
  'img-gen/water1.png': uri('img-gen/water1-web.jpg', 'image/jpeg'),
  'img-gen/branch1-cut-blur.png': uri('img-gen/branch1-cut-blur.png', 'image/png'),
  'img-gen/branch1-cut.png': uri('img-gen/branch1-cut-web.png', 'image/png'),
};
for (let i = 1; i <= 6; i++) MAP[`img-gen/leaf${i}.png`] = uri(`img-gen/leaf${i}.png`, 'image/png');

let html = readFileSync('kotonoha-ai.html', 'utf8');
for (const [k, v] of Object.entries(MAP)) html = html.split(k).join(v);
writeFileSync('kotonoha-ai.artifact.html', html);
console.log(`kotonoha-ai.artifact.html: ${(html.length / 1024 / 1024).toFixed(2)} MB`);
