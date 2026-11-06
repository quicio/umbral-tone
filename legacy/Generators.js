/**
 * Generators - Utilidades para generar patrones y loops
 * KISS: Funciones que generan callbacks para loops
 */

export const Generators = {
  /**
   * Genera un patrón de steps (1 = on, 0 = off)
   */
  pattern(steps, callback) {
    return (time, stepCount) => {
      const step = stepCount % steps.length;
      if (steps[step]) {
        callback(time, step, stepCount);
      }
    };
  },

  /**
   * Genera un patrón 4/4 (kick en 1, 5, 9, 13)
   */
  kick4_4(callback) {
    const steps = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    return this.pattern(steps, callback);
  },

  /**
   * Genera un patrón aleatorio con probabilidad
   */
  random(probability, callback) {
    return (time, stepCount) => {
      if (Math.random() < probability) {
        callback(time, stepCount);
      }
    };
  },

  /**
   * Genera un patrón que se repite cada N steps
   */
  every(n, callback) {
    return (time, stepCount) => {
      if (stepCount % n === 0) {
        callback(time, stepCount);
      }
    };
  },

  /**
   * Genera un ciclo de energía (fade in/out)
   */
  energyCycle(length, callback) {
    let cycle = 0;
    return (time, stepCount) => {
      cycle = (cycle + 1) % length;
      let energy = 0;
      
      // Fade in en el segundo cuarto, full en el último cuarto
      const quarter = length / 4;
      if (cycle < quarter) {
        energy = 0;
      } else if (cycle < quarter * 2) {
        energy = (cycle - quarter) / quarter;
      } else {
        energy = 1;
      }
      
      callback(time, stepCount, energy, cycle);
    };
  },

  /**
   * Selecciona un elemento aleatorio de un array
   */
  randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Genera variación de pitch (playbackRate)
   */
  pitchVariation(base = 1, range = 0.1) {
    return base + (Math.random() - 0.5) * range * 2;
  }
};

