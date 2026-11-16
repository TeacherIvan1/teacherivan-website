import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cleanTranscript, mergeTranscriptionChunks } from './transcriptCleaner';

describe('Transcript Cleaner & Phonetic Normalizer', () => {
  it('corrects brand variations to "Teacher Ivan English Classes"', () => {
    assert.strictEqual(
      cleanTranscript('Welcome to teacher english classes today'),
      'Welcome to Teacher Ivan English Classes today'
    );
  });

  it('corrects phonetic misinterpretations of Sucre', () => {
    assert.strictEqual(
      cleanTranscript('I live in Sukra and love the weather'),
      'I live in Sucre and love the weather'
    );
    assert.strictEqual(
      cleanTranscript('I visited sucre bolivia last summer'),
      'I visited Sucre, Bolivia last summer'
    );
  });

  it('corrects phonetic slips of Teacher Ivan name variations', () => {
    assert.strictEqual(cleanTranscript('Hello teacher evan'), 'Hello Teacher Ivan');
    assert.strictEqual(cleanTranscript('Good morning teacher i van'), 'Good morning Teacher Ivan');
    assert.strictEqual(cleanTranscript('Thank you tutor ivan'), 'Thank you Teacher Ivan');
  });

  it('normalizes acoustic term bichronous', () => {
    assert.strictEqual(
      cleanTranscript('We practice with the Bichronous method'),
      'We practice with the bichronous method'
    );
  });

  it('handles empty, null, or unchanged strings safely', () => {
    assert.strictEqual(cleanTranscript(''), '');
    assert.strictEqual(cleanTranscript('I had coffee with my friends'), 'I had coffee with my friends');
  });
});

describe('mergeTranscriptionChunks - Overlap Aware Accumulation', () => {
  it('handles full cumulative replacement when incoming starts with existing', () => {
    const existing = 'I have an ide';
    const incoming = 'I have an idea';
    assert.strictEqual(mergeTranscriptionChunks(existing, incoming), 'I have an idea');
  });

  it('handles delta chunk with partial overlap at boundary', () => {
    const existing = 'I have an ide';
    const incoming = 'idea';
    // 'ide' overlaps -> appends 'a'
    assert.strictEqual(mergeTranscriptionChunks(existing, incoming), 'I have an idea');
  });

  it('handles clean non-overlapping delta chunk concatenation', () => {
    const existing = 'Good morning';
    const incoming = ' Teacher';
    assert.strictEqual(mergeTranscriptionChunks(existing, incoming), 'Good morning Teacher');
  });

  it('handles identical chunk without duplication', () => {
    const existing = 'Hello world';
    const incoming = 'Hello world';
    assert.strictEqual(mergeTranscriptionChunks(existing, incoming), 'Hello world');
  });

  it('handles empty strings cleanly', () => {
    assert.strictEqual(mergeTranscriptionChunks('', 'Hello'), 'Hello');
    assert.strictEqual(mergeTranscriptionChunks('Hello', ''), 'Hello');
  });
});
