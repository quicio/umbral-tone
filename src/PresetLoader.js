/**
 * PresetLoader - Carga y aplica presets de tracks generativos desde YAML/JSON
 * KISS: Carga configuración y la aplica al mixer
 */

export class PresetLoader {
  /**
   * Carga un preset desde una URL
   */
  static async loadPreset(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load preset: ${response.statusText}`);
      }
      const text = await response.text();
      
      // Intentar parsear como YAML primero, luego JSON
      let preset;
      try {
        // Si es YAML, necesitamos un parser (usaremos js-yaml si está disponible)
        // Por ahora, asumimos que el servidor puede servir JSON
        preset = JSON.parse(text);
      } catch (e) {
        // Si falla, intentar como YAML manualmente (básico)
        preset = this._parseYAML(text);
      }
      
      return preset;
    } catch (error) {
      console.error('Error loading preset:', error);
      throw error;
    }
  }

  /**
   * Parsea YAML básico (solo para casos simples)
   * Para YAML completo, usar una librería como js-yaml
   */
  static _parseYAML(text) {
    // Por ahora, asumimos que el servidor convierte YAML a JSON
    // O usamos una librería externa
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('YAML parsing not fully implemented. Use JSON or add js-yaml library.');
    }
  }

  /**
   * Aplica un preset a un mixer
   */
  static applyPreset(mixer, transport, preset) {
    // Aplicar BPM
    if (preset.bpm) {
      transport.setBPM(preset.bpm);
    }

    // Aplicar master volume
    if (preset.masterVolume !== undefined) {
      mixer.setMasterVolume(preset.masterVolume);
    }

    // Aplicar configuración por canal
    if (preset.channels) {
      Object.entries(preset.channels).forEach(([key, config]) => {
        const channel = mixer.getChannel(key);
        if (!channel) return;

        // Volumen
        if (config.volume !== undefined) {
          channel.setVolume(config.volume);
        }

        // Mute/Solo
        if (config.muted !== undefined) {
          channel.setMute(config.muted);
        }
        if (config.solo !== undefined) {
          channel.setSolo(config.solo);
        }

        // Efectos - solo aplicar si el canal tiene efectos configurados
        if (config.effects && config.effects !== null) {
          // Delay
          if (config.effects.delay) {
            const delay = channel.getDelay();
            if (delay && delay.wet && delay.feedback && delay.delayTime) {
              try {
                if (config.effects.delay.wet !== undefined) {
                  delay.wet.value = config.effects.delay.wet;
                }
                if (config.effects.delay.feedback !== undefined) {
                  delay.feedback.value = config.effects.delay.feedback;
                }
                if (config.effects.delay.delayTime !== undefined) {
                  // delayTime puede ser un string como '8n' o un número
                  // Si es un número, convertirlo a segundos si es necesario
                  const delayTimeValue = config.effects.delay.delayTime;
                  if (typeof delayTimeValue === 'number') {
                    delay.delayTime.value = delayTimeValue;
                  } else if (typeof delayTimeValue === 'string') {
                    delay.delayTime.value = delayTimeValue;
                  }
                }
              } catch (e) {
                console.warn(`Error applying delay to channel ${key}:`, e);
              }
            }
          }

          // Reverb
          if (config.effects.reverb) {
            const reverb = channel.getReverb();
            if (reverb && reverb.wet) {
              try {
                if (config.effects.reverb.wet !== undefined) {
                  reverb.wet.value = config.effects.reverb.wet;
                }
                const decay = config.effects.reverb.decay;
                const roomSize = config.effects.reverb.roomSize;
                if (decay !== undefined && reverb.decay) {
                  reverb.decay.value = decay;
                } else if (roomSize !== undefined) {
                  if (reverb.roomSize && reverb.roomSize.value !== undefined) {
                    reverb.roomSize.value = roomSize;
                  } else if (reverb.decay && reverb.decay.value !== undefined) {
                    // Tone 14 reemplazó roomSize por decay (segundos).
                    reverb.decay.value = 0.5 + roomSize * 5.5;
                  }
                }
              } catch (e) {
                console.warn(`Error applying reverb to channel ${key}:`, e);
              }
            }
          }
        }
      });
    }

    // Actualizar estados de canales
    mixer.updateChannelStates();
  }
}

