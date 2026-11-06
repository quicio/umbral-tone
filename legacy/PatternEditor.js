/**
 * PatternEditor - Editor visual de patrones para canales
 * KISS: Visualiza y edita patrones de steps (on/off)
 */

export class PatternEditor {
  constructor(channel, patternLength = 16) {
    this.channel = channel;
    this.patternLength = patternLength;
    this.pattern = new Array(patternLength).fill(0); // 0 = off, 1 = on
    this.currentStep = 0;
    this.container = null;
    this.callbacks = [];
  }

  /**
   * Establece el patrón inicial
   */
  setPattern(pattern) {
    if (pattern.length !== this.patternLength) {
      console.warn(`Pattern length mismatch. Expected ${this.patternLength}, got ${pattern.length}`);
      return;
    }
    this.pattern = [...pattern];
    this.updateUI();
  }

  /**
   * Obtiene el patrón actual
   */
  getPattern() {
    return [...this.pattern];
  }

  /**
   * Toggle un step
   */
  toggleStep(index) {
    if (index >= 0 && index < this.patternLength) {
      this.pattern[index] = this.pattern[index] === 1 ? 0 : 1;
      this.updateUI();
      this.notifyChange();
    }
  }

  /**
   * Establece un step
   */
  setStep(index, value) {
    if (index >= 0 && index < this.patternLength) {
      this.pattern[index] = value ? 1 : 0;
      this.updateUI();
      this.notifyChange();
    }
  }

  /**
   * Actualiza el step actual (para visualización en tiempo real)
   */
  setCurrentStep(step) {
    this.currentStep = step % this.patternLength;
    this.updateUI();
  }

  /**
   * Crea la UI del editor
   * Acepta un ID de contenedor o un elemento DOM directamente
   */
  createUI(containerIdOrElement) {
    let container;
    if (typeof containerIdOrElement === 'string') {
      container = document.getElementById(containerIdOrElement);
      if (!container) {
        console.error(`Container ${containerIdOrElement} not found`);
        return;
      }
    } else if (containerIdOrElement instanceof HTMLElement) {
      container = containerIdOrElement;
    } else {
      console.error('Invalid container parameter');
      return;
    }

    this.container = document.createElement('div');
    this.container.className = 'pattern-editor';
    
    const label = document.createElement('div');
    label.className = 'pattern-label';
    label.textContent = 'Patrón';
    this.container.appendChild(label);

    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'pattern-steps';
    
    for (let i = 0; i < this.patternLength; i++) {
      const step = document.createElement('button');
      step.type = 'button';
      step.className = 'pattern-step';
      step.dataset.index = i;
      step.textContent = i + 1;
      step.setAttribute('aria-label', 'Paso ' + (i + 1));
      step.setAttribute('aria-pressed', 'false');
      step.addEventListener('click', () => {
        this.toggleStep(i);
      });
      stepsContainer.appendChild(step);
    }
    
    this.container.appendChild(stepsContainer);

    // Botones de utilidad
    const controls = document.createElement('div');
    controls.className = 'pattern-controls';
    
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'pattern-btn';
    clearBtn.textContent = 'Limpiar';
    clearBtn.addEventListener('click', () => {
      this.pattern.fill(0);
      this.updateUI();
      this.notifyChange();
    });
    controls.appendChild(clearBtn);
    
    const fillBtn = document.createElement('button');
    fillBtn.type = 'button';
    fillBtn.className = 'pattern-btn';
    fillBtn.textContent = 'Llenar';
    fillBtn.addEventListener('click', () => {
      this.pattern.fill(1);
      this.updateUI();
      this.notifyChange();
    });
    controls.appendChild(fillBtn);
    
    this.container.appendChild(controls);
    container.appendChild(this.container);
    
    this.updateUI();
  }

  /**
   * Actualiza la UI
   */
  updateUI() {
    if (!this.container) return;
    
    const steps = this.container.querySelectorAll('.pattern-step');
    steps.forEach((step, index) => {
      const isActive = this.pattern[index] === 1;
      const isCurrent = index === this.currentStep;
      
      step.classList.toggle('active', isActive);
      step.classList.toggle('current', isCurrent);
      step.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      step.setAttribute('aria-label', 'Paso ' + (index + 1) + (isActive ? ', activo' : ', inactivo'));
    });
  }

  /**
   * Añade un callback que se ejecuta cuando el patrón cambia
   */
  onChange(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Notifica cambios
   */
  notifyChange() {
    this.callbacks.forEach(cb => {
      try {
        cb(this.getPattern());
      } catch (e) {
        console.error('Error in pattern change callback:', e);
      }
    });
  }

  /**
   * Limpia recursos
   */
  dispose() {
    if (this.container) {
      this.container.remove();
    }
    this.callbacks = [];
  }
}

