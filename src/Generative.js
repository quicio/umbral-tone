/**
 * Generative — reglas musicales deterministas para el Mixer Generativo.
 * Sin Tone.js: solo patrones, semillas, euclid y transformaciones.
 */

export const PATTERN_LENGTH = 16;

export const SCENES = {
  umbral: {
    label: 'Umbral',
    params: { density: 0.55, complexity: 0.35, variation: 0.25, stability: 0.72, randomness: 0.18 },
    harmony: { root: 0, scale: 'minor', progression: 'menor', sustain: 0.5 }
  },
  deriva: {
    label: 'Deriva',
    params: { density: 0.45, complexity: 0.55, variation: 0.5, stability: 0.4, randomness: 0.55 },
    harmony: { root: 2, scale: 'dorian', progression: 'epica', sustain: 0.68 }
  },
  pulso: {
    label: 'Pulso',
    params: { density: 0.7, complexity: 0.25, variation: 0.18, stability: 0.85, randomness: 0.1 },
    harmony: { root: 5, scale: 'minorPent', progression: 'pedal', sustain: 0.34 }
  },
  caos: {
    label: 'Caos contenido',
    params: { density: 0.62, complexity: 0.7, variation: 0.65, stability: 0.3, randomness: 0.65 },
    harmony: { root: 1, scale: 'phrygian', progression: 'cadencia', sustain: 0.56 }
  }
};

export const ROOTS = [
  { label: 'Do', pc: 0 },
  { label: 'Do#', pc: 1 },
  { label: 'Re', pc: 2 },
  { label: 'Mib', pc: 3 },
  { label: 'Mi', pc: 4 },
  { label: 'Fa', pc: 5 },
  { label: 'Fa#', pc: 6 },
  { label: 'Sol', pc: 7 },
  { label: 'Lab', pc: 8 },
  { label: 'La', pc: 9 },
  { label: 'Sib', pc: 10 },
  { label: 'Si', pc: 11 }
];

export const SCALES = {
  minor: { label: 'Menor natural', intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmonic: { label: 'Menor armónica', intervals: [0, 2, 3, 5, 7, 8, 11] },
  dorian: { label: 'Dórica', intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { label: 'Frigia', intervals: [0, 1, 3, 5, 7, 8, 10] },
  major: { label: 'Mayor', intervals: [0, 2, 4, 5, 7, 9, 11] },
  minorPent: { label: 'Pentatónica menor', intervals: [0, 3, 5, 7, 10] },
  majorPent: { label: 'Pentatónica mayor', intervals: [0, 2, 4, 7, 9] }
};

export const PROGRESSIONS = {
  menor: { label: 'i · VI · III · VII', degrees: [0, 5, 2, 6] },
  cadencia: { label: 'i · iv · v · i', degrees: [0, 3, 4, 0] },
  epica: { label: 'i · VI · VII · v', degrees: [0, 5, 6, 4] },
  pedal: { label: 'Pedal', degrees: [0, 0, 0, 0] }
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNote(midi) {
  const value = Math.round(midi);
  return NOTE_NAMES[((value % 12) + 12) % 12] + (Math.floor(value / 12) - 1);
}

export function scaleDegreeMidi(rootPc, scaleKey, degree, octave = 3) {
  const scale = SCALES[scaleKey] || SCALES.minor;
  const intervals = scale.intervals;
  const length = intervals.length;
  const wrapped = ((degree % length) + length) % length;
  const octaveShift = Math.floor(degree / length);
  return 12 * (octave + 1) + rootPc + intervals[wrapped] + octaveShift * 12;
}

export function scaleNotes(rootPc, scaleKey, octave = 3, count = 14) {
  return Array.from({ length: count }, (_, index) =>
    midiToNote(scaleDegreeMidi(rootPc, scaleKey, index, octave))
  );
}

export function chordNotes(rootPc, scaleKey, degree, octave = 3, size = 3) {
  return Array.from({ length: size }, (_, index) =>
    midiToNote(scaleDegreeMidi(rootPc, scaleKey, degree + index * 2, octave))
  );
}

export const DEFAULT_PARAMS = { ...SCENES.umbral.params };

export const CHANNEL_SEEDS = {
  kick: { pulses: 4, offset: 0 },
  bass: { pulses: 5, offset: 1 },
  hihat: { pulses: 8, offset: 0 },
  perc: { pulses: 3, offset: 2 }
};

export function hashString(value) {
  let h = 0x811c9dc5;
  const text = String(value);
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function makeRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash01(seed, key, step, salt) {
  let h = (seed | 0) ^ hashString(key) ^ Math.imul(step | 0, 0x9e3779b1) ^ Math.imul(salt | 0, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function euclidean(steps, pulses, offset = 0) {
  const total = Math.max(1, Math.min(steps, Math.floor(steps)));
  const hits = Math.max(1, Math.min(total, Math.floor(pulses)));
  const pattern = new Array(total).fill(0);
  let bucket = total - hits;
  for (let i = 0; i < total; i++) {
    bucket += hits;
    if (bucket >= total) {
      bucket -= total;
      pattern[(i + offset + total) % total] = 1;
    }
  }
  return pattern;
}

export function count(pattern) {
  return pattern.reduce((sum, value) => sum + (value ? 1 : 0), 0);
}

export function rotatePattern(pattern, amount = 1) {
  const length = pattern.length;
  const shift = ((amount % length) + length) % length;
  return pattern.slice(shift).concat(pattern.slice(0, shift));
}

export function generatePattern(key, params, pulses, seed) {
  const base = euclidean(PATTERN_LENGTH, pulses, CHANNEL_SEEDS[key] ? CHANNEL_SEEDS[key].offset : 0);
  const rng = makeRng((seed >>> 0) ^ hashString(key));
  const pattern = new Array(PATTERN_LENGTH).fill(0);

  for (let step = 0; step < PATTERN_LENGTH; step++) {
    const downbeat = step % 4 === 0;
    const offbeat = step % 2 === 1;

    let probability = 0.06 + params.density * 0.55;
    if (base[step]) probability += 0.28 * (1 - params.randomness * 0.5);
    if (downbeat) probability += 0.15;
    if (offbeat) probability += params.complexity * 0.18;
    probability += (rng() - 0.5) * params.randomness * 0.22;

    if (key === 'kick' && (step === 0 || step === 8)) probability = 1;
    pattern[step] = rng() < probability ? 1 : 0;
  }

  return pattern;
}

export function mutatePattern(pattern, params, seed, key) {
  const rng = makeRng((seed >>> 0) ^ hashString(key) ^ 0x9e3779b9);
  const next = pattern.slice();

  for (let step = 0; step < next.length; step++) {
    if (rng() < params.stability) continue;

    if (next[step]) {
      if (rng() < params.variation * 0.7) next[step] = 0;
    } else if (rng() < params.variation * (0.25 + params.density * 0.6)) {
      next[step] = 1;
    }
  }

  if (count(next) === 0) next[0] = 1;
  return next;
}

export function thinPattern(pattern, params, seed, key) {
  const rng = makeRng((seed >>> 0) ^ hashString(key) ^ 0x85ebca6b);
  const next = pattern.slice();

  for (let step = 0; step < next.length; step++) {
    if (next[step] && rng() < 0.35 + params.density * 0.25) next[step] = 0;
  }

  if (count(next) === 0) next[0] = 1;
  return next;
}

export function fillPattern(pattern, params, seed, key) {
  const rng = makeRng((seed >>> 0) ^ hashString(key) ^ 0xc2b2ae35);
  const next = pattern.slice();

  for (let step = 0; step < next.length; step++) {
    if (!next[step] && rng() < 0.25 + params.density * 0.5 + params.complexity * 0.2) {
      next[step] = 1;
    }
  }

  return next;
}

export function scenePatterns(sceneName, seed, frozen, pulses) {
  const scene = SCENES[sceneName] || SCENES.umbral;
  const result = {};

  Object.keys(CHANNEL_SEEDS).forEach(key => {
    if (frozen && frozen[key]) return;
    result[key] = generatePattern(key, scene.params, pulses[key], seed);
  });

  return result;
}
