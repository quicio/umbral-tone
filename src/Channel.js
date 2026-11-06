import * as Tone from 'tone';

/**
 * Channel - Clase base para manejar un canal de audio
 * KISS: Un canal = una fuente de sonido + efectos + volumen + mute/solo
 */
export class Channel {
  constructor(config = {}) {
    this.name = config.name || 'Channel';
    this.source = config.source || null; // Tone.js source (synth, player, etc.)
    this.volume = new Tone.Volume(config.volume || 0);
    this.muted = false;
    this.solo = false;
    this.effects = [];
    this.loop = null;
    this.output = this.volume; // Último nodo de la cadena
  }

  /**
   * Conecta un efecto a la cadena del canal
   */
  addEffect(effect) {
    this.effects.push(effect);
    this._rebuildChain();
    return this;
  }

  /**
   * Conecta múltiples efectos en orden
   */
  addEffects(effects) {
    this.effects.push(...effects);
    this._rebuildChain();
    return this;
  }

  /**
   * Reconstruye la cadena de audio: source -> effects -> volume
   */
  _rebuildChain() {
    if (!this.source) return;

    // Desconectar todo
    if (this.source.disconnect) {
      this.source.disconnect();
    }

    // Construir cadena: source -> effects -> volume
    let currentNode = this.source;
    this.effects.forEach(effect => {
      currentNode.connect(effect);
      currentNode = effect;
    });
    currentNode.connect(this.volume);
    this.output = this.volume;
  }

  /**
   * Conecta el canal a un destino
   */
  connect(destination) {
    this.output.connect(destination);
    return this;
  }

  /**
   * Desconecta el canal
   */
  disconnect() {
    this.output.disconnect();
    return this;
  }

  /**
   * Establece el volumen en dB
   */
  setVolume(db) {
    this.volume.volume.value = db;
    return this;
  }

  /**
   * Obtiene el volumen actual
   */
  getVolume() {
    return this.volume.volume.value;
  }

  /**
   * Mute/unmute del canal
   */
  setMute(muted) {
    this.muted = muted;
    this.volume.mute = muted;
    return this;
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    return this.setMute(!this.muted);
  }

  /**
   * Activa/desactiva solo
   */
  setSolo(solo) {
    this.solo = solo;
    return this;
  }

  /**
   * Toggle solo
   */
  toggleSolo() {
    return this.setSolo(!this.solo);
  }

  /**
   * Establece un loop para el canal
   * Si se proporciona un transport, el callback recibirá (time, stepCount)
   */
  setLoop(callback, interval, transport = null) {
    if (this.loop) {
      this.loop.dispose();
    }
    if (transport && transport.createLoop) {
      this.loop = transport.createLoop(callback, interval);
    } else {
      this.loop = new Tone.Loop(callback, interval);
    }
    return this;
  }

  /**
   * Inicia el loop
   */
  startLoop(time) {
    if (this.loop) {
      this.loop.start(time);
    }
    return this;
  }

  /**
   * Detiene el loop
   */
  stopLoop() {
    if (this.loop) {
      this.loop.stop();
    }
    return this;
  }

  /**
   * Obtiene un efecto por tipo
   */
  getEffect(type) {
    return this.effects.find(effect => effect instanceof type);
  }

  /**
   * Obtiene el delay si existe
   */
  getDelay() {
    return this.getEffect(Tone.FeedbackDelay);
  }

  /**
   * Obtiene el reverb si existe
   */
  getReverb() {
    return this.getEffect(Tone.Reverb);
  }

  /**
   * Limpia recursos
   */
  dispose() {
    if (this.loop) {
      this.loop.dispose();
    }
    if (this.source) {
      if (this.source.dispose) this.source.dispose();
    }
    this.effects.forEach(effect => {
      if (effect.dispose) effect.dispose();
    });
    this.volume.dispose();
  }
}

