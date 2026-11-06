import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PATTERN_LENGTH,
  euclidean,
  count,
  generatePattern,
  mutatePattern,
  rotatePattern,
  hash01,
  scaleDegreeMidi,
  scaleNotes,
  chordNotes,
  midiToNote
} from '../src/Generative.js';

const params = { density: 0.55, complexity: 0.35, variation: 0.25, stability: 0.72, randomness: 0.18 };

test('euclidean distributes pulses across the pattern', () => {
  const pattern = euclidean(16, 4, 0);
  assert.equal(pattern.length, 16);
  assert.equal(count(pattern), 4);
  assert.deepEqual(pattern.map((value, index) => value ? index : -1).filter(index => index >= 0), [0, 4, 8, 12]);
});

test('patterns are reproducible by seed', () => {
  const a = generatePattern('bass', params, 5, 4821);
  const b = generatePattern('bass', params, 5, 4821);
  const c = generatePattern('bass', params, 5, 4822);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(a.length, PATTERN_LENGTH);
});

test('mutation preserves length and guarantees a hit', () => {
  const source = generatePattern('perc', params, 3, 11);
  const next = mutatePattern(source, params, 12, 'perc');
  assert.equal(next.length, PATTERN_LENGTH);
  assert.ok(count(next) >= 1);
});

test('rotation keeps the same number of hits', () => {
  const source = generatePattern('hihat', params, 8, 99);
  const next = rotatePattern(source, 3);
  assert.equal(count(source), count(next));
});

test('hash01 is deterministic and bounded', () => {
  const a = hash01(4821, 'kick', 7, 4);
  const b = hash01(4821, 'kick', 7, 4);
  assert.equal(a, b);
  assert.ok(a >= 0 && a < 1);
});

test('scale helpers produce the expected notes', () => {
  assert.deepEqual(scaleNotes(0, 'minor', 3, 8), ['C3', 'D3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4']);
  assert.deepEqual(chordNotes(0, 'minor', 0, 3, 4), ['C3', 'D#3', 'G3', 'A#3']);
  assert.equal(midiToNote(60), 'C4');
  assert.equal(scaleDegreeMidi(0, 'minor', 7, 3), 60);
});
