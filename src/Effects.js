import * as Tone from 'tone';

/**
 * Effects - Utilidades para crear efectos de audio comunes
 * KISS: Funciones simples que retornan efectos configurados
 */

export const Effects = {
  /**
   * Crea un delay con feedback
   */
  delay(config = {}) {
    return new Tone.FeedbackDelay({
      delayTime: config.delayTime || '8n',
      feedback: config.feedback || 0.3,
      wet: config.wet || 0.3
    });
  },

  /**
   * Crea un reverb
   */
  reverb(config = {}) {
    const reverb = new Tone.Reverb({
      roomSize: config.roomSize || 0.8,
      dampening: config.dampening || 2000
    });
    reverb.wet.value = config.wet || 0.4;
    return reverb;
  },

  /**
   * Crea un filtro con LFO
   */
  filter(config = {}) {
    const filter = new Tone.Filter({
      type: config.type || 'lowpass',
      frequency: config.frequency || 1000,
      Q: config.Q || 1
    });

    if (config.lfo) {
      const lfo = new Tone.LFO({
        frequency: config.lfo.frequency || 1,
        min: config.lfo.min || 200,
        max: config.lfo.max || 2000
      });
      lfo.connect(filter.frequency);
      lfo.start();
      filter.lfo = lfo; // Guardar referencia para poder detenerlo
    }

    return filter;
  },

  /**
   * Crea un chorus
   */
  chorus(config = {}) {
    return new Tone.Chorus({
      frequency: config.frequency || 1.5,
      delayTime: config.delayTime || 3.5,
      depth: config.depth || 0.7,
      wet: config.wet || 0.3
    });
  },

  /**
   * Crea un compressor
   */
  compressor(config = {}) {
    return new Tone.Compressor({
      threshold: config.threshold || -24,
      ratio: config.ratio || 12,
      attack: config.attack || 0.003,
      release: config.release || 0.1
    });
  },

  /**
   * Crea una cadena de efectos común (delay + reverb)
   */
  ambient(config = {}) {
    return [
      this.delay(config.delay || {}),
      this.reverb(config.reverb || {})
    ];
  }
};

