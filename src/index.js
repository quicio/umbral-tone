/**
 * umbral-tone — motor modular de audio y generación musical determinista.
 *
 * Núcleo reutilizable de Espiral. No incluye UI ni el instrumento:
 * expone canales, mixer, transporte, efectos y reglas generativas.
 */

import { Channel } from './Channel.js';
import { Mixer } from './Mixer.js';
import { Transport } from './Transport.js';
import { Effects } from './Effects.js';
import { PresetLoader } from './PresetLoader.js';
import * as Generative from './Generative.js';

export { Channel, Mixer, Transport, Effects, PresetLoader, Generative };
export * from './Generative.js';

export default {
  Channel,
  Mixer,
  Transport,
  Effects,
  PresetLoader,
  Generative
};
