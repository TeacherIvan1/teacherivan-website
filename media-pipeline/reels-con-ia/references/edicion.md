# La edición en código

`reel.html` es una página de 1080 × 1920. `render.py` la recorre cuadro a cuadro llamando a `seek(t)`, así que todo lo que se ve depende sólo del segundo `t`: nada de animaciones CSS con tiempo propio ni `setTimeout`.

## Qué completar

- **`CONFIG`:**
  - `DURACION` es la de `voz.mp3`.
  - `GANCHO_FIN` y `CIERRE_DESDE` coinciden con los tramos de las tomas.
  - `TITULO` va en dos líneas cortas, en mayúsculas, con la idea del gancho.
  - `CTA` y `BPM` se completan con el llamado a la acción y el pulso de la música elegida.
- **`ESCENAS`:** una por idea del guion, con `desde` y `hasta` sacados de `palabras.json`. La primera escena va durante el gancho y se ve arriba del avatar. `html` es lo que se ve y `anim(el, p, t)` lo mueve: `p` va de 0 a 1 dentro de la escena y `t` son los segundos desde que empezó. Usá `entrar(elemento, x)` para que algo aparezca con un pequeño rebote.

## Cómo se ve bien

- **Una idea por escena, traducida a algo simple de ver:** un número que cuenta, una palabra grande, tres pasos que aparecen, un antes y un después, un logo real. El texto del guion no va en pantalla: para eso están los subtítulos.
- **Material real cuando lo hay:** capturas, fotos o videos de lo que se cuenta, chicos y bien encuadrados, nunca una captura gigante ilegible. Logos de marcas, siempre los oficiales (SVG).
- **Cambios sobre el pulso:** el principio y el final de cada escena caen en múltiplos de `60 / BPM` segundos.
- **Gancho:** escena arriba, avatar abajo y título en la unión, desde el primer cuadro. Tiene que entenderse sin sonido.
- **Grande y legible en el celular:** textos de 50 px para arriba, como mucho dos o tres elementos por escena y aire alrededor.
- Los estilos de la plantilla son un punto de partida: cambiá colores y letras por los de la marca de la persona si los tiene.

## Revisar antes del render completo

`render.py reels/X --muestras …` saca cuadros sueltos en `muestras/`. Miralos: que nada se corte ni se superponga, que los subtítulos no tapen lo importante y que el avatar se vea bien encuadrado. El render completo de un reel de 40 segundos tarda unos minutos.
