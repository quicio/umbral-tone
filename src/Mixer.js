import * as Tone from 'tone';

/**
 * Mixer - Maneja múltiples canales de audio
 * KISS: Un mixer = múltiples canales + master volume
 */
export class Mixer {
  constructor(config = {}) {
    this.channels = new Map();
    this.masterVolume = new Tone.Volume(config.masterVolume || -4);
    this.masterVolume.toDestination();
  }

  /**
   * Añade un canal al mixer
   */
  addChannel(key, channel) {
    this.channels.set(key, channel);
    channel.connect(this.masterVolume);
    return this;
  }

  /**
   * Obtiene un canal por su clave
   */
  getChannel(key) {
    return this.channels.get(key);
  }

  /**
   * Obtiene todos los canales
   */
  getChannels() {
    return Array.from(this.channels.values());
  }

  /**
   * Obtiene las claves de todos los canales
   */
  getChannelKeys() {
    return Array.from(this.channels.keys());
  }

  /**
   * Actualiza el estado de mute/solo de todos los canales
   */
  updateChannelStates() {
    const hasSolo = Array.from(this.channels.values()).some(ch => ch.solo);
    
    this.channels.forEach(channel => {
      if (hasSolo) {
        channel.volume.mute = !channel.solo;
      } else {
        channel.volume.mute = channel.muted;
      }
    });
    
    return this;
  }

  /**
   * Establece el volumen master
   */
  setMasterVolume(db) {
    this.masterVolume.volume.value = db;
    return this;
  }

  /**
   * Obtiene el volumen master
   */
  getMasterVolume() {
    return this.masterVolume.volume.value;
  }

  /**
   * Inicia todos los loops de los canales
   */
  startLoops(time = 0) {
    this.channels.forEach(channel => {
      channel.startLoop(time);
    });
    return this;
  }

  /**
   * Detiene todos los loops de los canales
   */
  stopLoops() {
    this.channels.forEach(channel => {
      channel.stopLoop();
    });
    return this;
  }

  /**
   * Limpia todos los recursos
   */
  dispose() {
    this.channels.forEach(channel => {
      channel.dispose();
    });
    this.masterVolume.dispose();
    this.channels.clear();
  }
}

