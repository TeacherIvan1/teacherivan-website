import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { renderReelWithRemotion } from './render-remotion.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIPELINE_DIR = path.resolve(__dirname, '..');

async function testRemotionIntegration() {
  console.log('=== STARTING REMOTION INTEGRATION VALIDATION ===\n');

  // 1. Verify Entry Points
  console.log('1. Checking Remotion entry points & configs...');
  assert.ok(fs.existsSync(path.join(PIPELINE_DIR, 'remotion/index.ts')), 'index.ts must exist');
  assert.ok(fs.existsSync(path.join(PIPELINE_DIR, 'remotion/Root.tsx')), 'Root.tsx must exist');
  assert.ok(fs.existsSync(path.join(PIPELINE_DIR, 'remotion/TeacherIvanReel.tsx')), 'TeacherIvanReel.tsx must exist');
  assert.ok(fs.existsSync(path.join(PIPELINE_DIR, 'remotion.config.ts')), 'remotion.config.ts must exist');
  assert.ok(fs.existsSync(path.join(PIPELINE_DIR, 'tailwind.config.js')), 'tailwind.config.js must exist');
  console.log('✓ All entry points & configs verified.\n');

  // 2. TypeScript compilation
  console.log('2. Running TypeScript typecheck...');
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(npxCmd, ['tsc', '--noEmit', '-p', 'tsconfig.json'], {
    cwd: PIPELINE_DIR,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  console.log('✓ TypeScript compiles with 0 errors.\n');

  // 3. Test Remotion Render on Reel with palabras.json (3-second test)
  console.log('3. Testing renderReelWithRemotion with props & Chibi rig...');
  const testOutput = path.join(PIPELINE_DIR, 'output/remotion-pipeline-test.mp4');
  const result = await renderReelWithRemotion({
    reelDir: path.join(PIPELINE_DIR, 'Reels/reels/2026-10-20-clon-ia-ingles'),
    outputPath: testOutput,
    persona: 'ivan',
    quickTest: true,
  });

  console.log('Render Result:', result);
  assert.ok(fs.existsSync(result.finalMp4), 'Final MP4 must exist');
  assert.ok(result.sizeBytes > 500000, `Video must be > 500KB (actual: ${result.sizeBytes} bytes)`);
  assert.ok(result.posterPath && fs.existsSync(result.posterPath), 'Hero poster must exist');
  console.log('✓ Remotion MP4 video and poster generated successfully.\n');

  // 4. Test Coach Emma Rig variation still
  console.log('4. Testing Coach Emma character rig still frame...');
  const emmaStill = path.join(PIPELINE_DIR, 'output/emma-test-still.png');
  const propsPath = path.join(PIPELINE_DIR, 'public/reels/2026-10-20-clon-ia-ingles/props.json');
  
  execFileSync(npxCmd, [
    'remotion',
    'still',
    'remotion/index.ts',
    'TeacherIvanReel',
    `"${path.relative(PIPELINE_DIR, emmaStill).replace(/\\/g, '/')}"`,
    `"--props=${path.relative(PIPELINE_DIR, propsPath).replace(/\\/g, '/')}"`,
    '--frame=30',
    '--overwrite',
  ], {
    cwd: PIPELINE_DIR,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  assert.ok(fs.existsSync(emmaStill), 'Emma still frame must exist');
  console.log('✓ Coach Emma still frame generated successfully.\n');

  console.log('=== ALL REMOTION PIPELINE CHECKS PASSED PERFECTLY ===');
}

testRemotionIntegration().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
