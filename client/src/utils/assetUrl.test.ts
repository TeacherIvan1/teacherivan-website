import { describe, it } from 'node:test';
import assert from 'node:assert';
import { withVersion } from './assetUrl';

describe('withVersion asset helper', () => {
  it('returns empty string if input is empty', () => {
    assert.strictEqual(withVersion(''), '');
  });

  it('appends ?v= parameter if url has no query string', () => {
    const url = withVersion('/assets/teacher-ivan.svg');
    assert.ok(url.startsWith('/assets/teacher-ivan.svg?v='));
  });

  it('appends &v= parameter if url already has query string', () => {
    const url = withVersion('/assets/audio.mp3?rate=1');
    assert.ok(url.startsWith('/assets/audio.mp3?rate=1&v='));
  });
});
