import { copyFile } from 'node:fs/promises';

// GitHub Pages serves this entry for direct station/route URLs and reloads.
// Asset URLs retain Vite's absolute /lrt-web-app/ deployment base.
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url));
