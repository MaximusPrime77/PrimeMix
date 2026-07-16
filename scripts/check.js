const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const jsFiles = ['main.js', 'preload.js', 'renderer/app.js'];
const jsonFiles = ['package.json', 'renderer/locales/en.json', 'renderer/locales/tr.json'];

for (const file of jsFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  new vm.Script(source, { filename: file });
}

for (const file of jsonFiles) {
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

const rendererHtml = fs.readFileSync(path.join(root, 'renderer/index.html'), 'utf8');
const rendererJs = fs.readFileSync(path.join(root, 'renderer/app.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'main.js'), 'utf8');

if (/\son[a-z]+\s*=/i.test(rendererHtml) || /\son(click|input|change)\s*=/i.test(rendererJs)) {
  throw new Error('Inline event handlers are not allowed.');
}
if (!rendererHtml.includes('Content-Security-Policy')) {
  throw new Error('Content Security Policy is missing.');
}
if (mainJs.includes('bypassCSP: true')) {
  throw new Error('The media protocol must not bypass CSP.');
}
if (!mainJs.includes('resolveInside(SOUNDS_DIR')) {
  throw new Error('Sound path containment check is missing.');
}

console.log('PrimeMix quality checks passed.');
