# umbral-tone

Motor modular de audio y generación musical determinista para instrumentos web. Es el núcleo de [Espiral](https://github.com/quicio/espiral), el instrumento generativo de [Quicio](https://github.com/quicio).

- **Tone.js** para el audio.
- Patrones de 16 pasos, Euclid, semilla y mutaciones.
- Escalas, grados, acordes y progresiones.
- Canales con volumen, mute/solo, delay y reverb.
- Transporte con swing, humanize y sincronización por ticks reales.

## Instalación

```bash
npm install tone @quicio/umbral-tone
```

`tone` es una peer dependency: la versión que instala el consumidor es la que usa el motor.

## Uso

```js
import * as Tone from 'tone';
import {
  Mixer,
  Channel,
  Transport,
  Effects,
  Generative
} from '@quicio/umbral-tone';

const mixer = new Mixer({ masterVolume: -4 });
const transport = new Transport({ bpm: 120 });
const channel = new Channel({ name: 'Kick', volume: -4 });

channel.source = new Tone.MembraneSynth();
channel._rebuildChain();
mixer.addChannel('kick', channel);

channel.setLoop((time, stepCount) => {
  if (stepCount % 4 === 0) channel.source.triggerAttackRelease('C1', '8n', time);
}, '16n', transport);

await transport.start();
mixer.startLoops();
```

## API

### Audio

- `new Transport({ bpm })` — tempo, play/stop, `onStep`, `createLoop`.
- `new Mixer({ masterVolume })` — canales, master, mute/solo, loops.
- `new Channel({ name, volume, source })` — fuente, efectos, fader, mute/solo.
- `Effects` — delay, reverb, filtro, chorus, compresor y cadena ambiental.
- `PresetLoader` — carga y aplica presets JSON.

### Generativo

- `SCENES` — estados musicales con parámetros y tonalidad.
- `ROOTS`, `SCALES`, `PROGRESSIONS` — vocabulario armónico.
- `generatePattern`, `mutatePattern`, `thinPattern`, `fillPattern`, `rotatePattern`.
- `euclidean`, `count`, `hash01`, `makeRng`.
- `scaleDegreeMidi`, `scaleNotes`, `chordNotes`, `midiToNote`.

## Desarrollo

```bash
npm install
npm test
```

Los tests cubren las reglas deterministas de `Generative.js` sin requerir navegador.

## Licencia

MIT.
