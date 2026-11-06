import * as Tone from 'tone';

/**
 * Transport - Controla el tempo y la reproducción
 * KISS: Transport = tempo + play/stop + step counter
 */
export class Transport {
  constructor(config = {}) {
    this.bpm = config.bpm || 120;
    this.stepCount = 0;
    this.isPlaying = false;
    this.callbacks = []; // Callbacks que se ejecutan en cada step
  }

  /**
   * Establece el BPM
   */
  setBPM(bpm) {
    this.bpm = bpm;
    Tone.Transport.bpm.value = bpm;
    return this;
  }

  /**
   * Obtiene el BPM actual
   */
  getBPM() {
    return this.bpm;
  }

  /**
   * Añade un callback que se ejecuta en cada step
   */
  onStep(callback) {
    this.callbacks.push(callback);
    return this;
  }

  /**
   * Deriva el índice de paso de 16n desde la posición real del transporte.
   * Evita depender del orden en que Tone ejecuta los loops de cada canal.
   */
  _stepAt(time) {
    if (typeof Tone.Transport.getTicksAtTime === 'function') {
      const ticks = Tone.Transport.getTicksAtTime(time);
      const stepTicks = Tone.Transport.PPQ / 4;
      return Math.max(0, Math.round(ticks / stepTicks));
    }
    return this.stepCount;
  }

  /**
   * Crea un loop que tiene acceso al stepCount
   */
  createLoop(callback, interval) {
    return new Tone.Loop((time) => {
      callback(time, this._stepAt(time));
    }, interval);
  }

  /**
   * Inicia la reproducción
   */
  async start() {
    if (this.isPlaying) return;
    
    await Tone.start();
    
    // Generar reverbs si es necesario
    await this._generateReverbs();
    
    Tone.Transport.bpm.value = this.bpm;
    this.stepCount = 0;
    
    // Crear loop principal que incrementa el step counter
    this.mainLoop = new Tone.Loop((time) => {
      this.stepCount = this._stepAt(time);
      this.callbacks.forEach(cb => {
        try {
          cb(time, this.stepCount);
        } catch (e) {
          console.error('Error en callback de step:', e);
        }
      });
    }, '16n');
    
    this.mainLoop.start(0);
    Tone.Transport.start();
    this.isPlaying = true;
    
    return this;
  }

  /**
   * Detiene la reproducción
   */
  stop() {
    if (!this.isPlaying) return;
    
    Tone.Transport.stop();
    if (this.mainLoop) {
      this.mainLoop.stop();
      this.mainLoop.dispose();
    }
    this.isPlaying = false;
    this.stepCount = 0;
    
    return this;
  }

  /**
   * Genera reverbs de todos los canales (si existen)
   * Esto se hace antes de empezar para evitar clicks
   */
  async _generateReverbs() {
    // Esta función puede ser sobrescrita o extendida
    // por el Mixer para generar reverbs de sus canales
    return Promise.resolve();
  }

  /**
   * Obtiene el contador de steps actual
   */
  getStepCount() {
    return this.stepCount;
  }

  /**
   * Resetea el contador de steps
   */
  resetStepCount() {
    this.stepCount = 0;
    return this;
  }

  /**
   * Limpia recursos
   */
  dispose() {
    this.stop();
    this.callbacks = [];
  }
}

