import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function findTestFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTestFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      results.push(full);
    }
  }
  return results.sort();
}

const testFiles = findTestFiles(path.resolve(process.cwd(), 'src'));
const env = {
  ...process.env,
  NODE_ENV: 'test',
  DISABLE_GOOGLE_SHEETS_SYNC: 'true',
};

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...testFiles], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
