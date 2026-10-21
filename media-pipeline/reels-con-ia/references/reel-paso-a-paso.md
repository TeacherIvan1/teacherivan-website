# El reel, paso a paso

Rutas: `SK` = la carpeta de esta skill (por ejemplo `~/.claude/skills/reels-con-ia`). Todo se corre desde la carpeta de reels. Contale a la persona en qué paso están y qué viene.

## 1. Guion → aprobado

Creá `reels/AAAA-MM-DD-tema/` con `guion.md` desde `plantillas/guion.md`. Escribí el guion según [guion](guion.md) y esperá «aprobado». Sin eso, no sigas.

## 2. Voz → control → OK

```
python3 SK/scripts/voz.py reels/X/voz.txt --out reels/X/voz.mp3
python3 SK/scripts/control.py reels/X/voz.mp3 --guion reels/X/voz.txt
```

- Si `control.py` marca diferencias reales (no nombres propios mal transcriptos), corregí `voz.txt` y regenerá. Para arreglar una sola frase en una voz larga: generá sólo esa frase y uní con ffmpeg cortando en un silencio.
- Pasale `voz.mp3` a la persona y esperá su OK antes del video.
- `palabras.json` queda con el tiempo de cada palabra: de ahí salen los subtítulos y los cortes.

## 3. Avatar → OK del gasto → tomas

El avatar aparece en el **gancho** (los primeros 5 a 8 segundos, en pantalla dividida) y en el **cierre** (el llamado a la acción). El resto del reel son animaciones: así se gasta menos y se ve mejor.

1. Elegí los tramos en `palabras.json`. El gancho termina al final de una frase, cerca de los 6 a 8 segundos; el cierre es la última frase o las dos últimas. Cada tramo dura entre 4 y 15 segundos.
2. Corré sin `--si` para ver texto y costo, y pedí permiso:
   ```
   python3 SK/scripts/avatar.py --audio reels/X/voz.mp3 --desde 0 --hasta 6.8 --out reels/X/tomas/t1.mp4
   ```
3. Con el OK, el mismo comando con `--si`. Después lo mismo para `t2.mp4` con el tramo del cierre.
4. Mirá cada toma con la persona antes de seguir. Si la cara, la ropa o el lugar salieron raros, revisá la foto antes de regenerar.

## 4. Música

Dos pedidos de estilos distintos, para elegir:

```
python3 SK/scripts/musica.py --estilo "minimal techno, 124 BPM, crisp, instrumental" --descripcion "…" --out reels/X/musica --prefijo a
python3 SK/scripts/musica.py --estilo "lo-fi hip hop, 88 BPM, warm, instrumental" --descripcion "…" --out reels/X/musica --prefijo b
```

Elegí la que va con el tono, o mostrale las opciones a la persona. Anotá el BPM: las escenas cambian sobre el pulso.

## 5. Edición

Copiá `SK/plantillas/reel.html` a `reels/X/reel.html` y completala según [edición](edicion.md). Revisá cuadros sueltos antes del render completo:

```
python3 SK/scripts/render.py reels/X --muestras 1,5,9,15,25,35
python3 SK/scripts/render.py reels/X --musica reels/X/musica/a1.mp3
```

## 6. Revisión

```
python3 SK/scripts/revision.py reels/X/final.mp4 --guion reels/X/voz.txt
```

Corregí lo que marque, volvé a renderizar y entregale a la persona `final.mp4` con un resumen corto: qué se hizo, el gasto total (de `costos.csv`) y lo que conviene revisar con sus propios ojos.

**Boca contra voz:** si la boca va atrasada respecto de la voz, adelantá el video en `reel.html` con un `data-desfase` negativo en ese `<video>` (por ejemplo `-0.15`). No regeneres la toma por eso.
