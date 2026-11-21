import fs from 'fs';
import path from 'path';

/**
 * Secret & Sensitive Information Security Scanner
 * Scans codebase files (client/src, client/dist, server/src) for exposed keys, credentials, or secrets.
 * MITRE ATT&CK: T1552 (Unsecured Credentials), DevSecOps Gate
 */

const TARGET_DIRECTORIES = [
  path.resolve(process.cwd(), 'client/src'),
  path.resolve(process.cwd(), 'server/src'),
];

// If client/dist exists, also scan it to ensure bundled assets are clean
const distPath = path.resolve(process.cwd(), 'client/dist');
if (fs.existsSync(distPath)) {
  TARGET_DIRECTORIES.push(distPath);
}

const FORBIDDEN_PATTERNS = [
  {
    name: 'Google API Key',
    regex: /AIzaSy[A-Za-z0-9_-]{33}/,
  },
  {
    name: 'OpenAI / Generic Secret Key',
    regex: /sk-[A-Za-z0-9]{32,}/,
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /ghp_[A-Za-z0-9]{36}/,
  },
  {
    name: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/,
  },
  {
    name: 'Plaintext Admin Password in Code',
    regex: /(?:password|passwd|pwd)\s*[:=]\s*['"]IvanAdmin2026!['"]/i,
    ignoreIn: [/test/i],
  },
];

const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.mp3', '.mp4', '.ico', '.woff', '.woff2'];

let violationsFound = 0;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scanDirectory(fullPath);
      }
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (IGNORE_EXTENSIONS.includes(ext)) continue;

    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const rule of FORBIDDEN_PATTERNS) {
        if (rule.ignoreIn && rule.ignoreIn.some((pattern) => pattern.test(fullPath))) {
          continue;
        }

        const match = content.match(rule.regex);
        if (match) {
          console.error(`[SECURITY ERROR] ${rule.name} detected in: ${path.relative(process.cwd(), fullPath)}`);
          console.error(`  Match snippet: "${match[0].substring(0, 15)}..."`);
          violationsFound++;
        }
      }
    } catch {
      // Ignore binary or unreadable files
    }
  }
}

console.log('\n======================================================');
console.log(' Starting Security & Secrets Scanner...');
console.log(' Scanning paths:', TARGET_DIRECTORIES.map((p) => path.relative(process.cwd(), p)).join(', '));
console.log('======================================================\n');

for (const targetDir of TARGET_DIRECTORIES) {
  scanDirectory(targetDir);
}

if (violationsFound > 0) {
  console.error(`\nFAILED: Found ${violationsFound} sensitive secret violations in scanned files.\n`);
  process.exit(1);
} else {
  console.log('PASSED: Zero exposed API keys, tokens, or plaintext credentials found.\n');
  process.exit(0);
}
