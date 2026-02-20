import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultOptions, run } from 'react-snap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mergeOptions(base, extra) {
  const merged = { ...base, ...extra };
  if (base && extra) {
    if (typeof base.puppeteer === 'object' && typeof extra.puppeteer === 'object') {
      merged.puppeteer = { ...base.puppeteer, ...extra.puppeteer };
    }
    if (Array.isArray(base.puppeteerArgs) && Array.isArray(extra.puppeteerArgs)) {
      merged.puppeteerArgs = extra.puppeteerArgs;
    }
    if (Array.isArray(base.include) && Array.isArray(extra.include)) {
      merged.include = extra.include;
    }
  }
  return merged;
}

const repoRoot = path.resolve(__dirname, '..');
const pkgPath = path.join(repoRoot, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

let options = mergeOptions(defaultOptions, pkg.reactSnap ?? {});

const envExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
if (typeof envExecutablePath === 'string' && envExecutablePath.trim()) {
  options.puppeteerExecutablePath = envExecutablePath.trim();
} else if (process.platform === 'darwin') {
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(macChrome)) {
    options.puppeteerExecutablePath = macChrome;
  }
}

await run(options);
