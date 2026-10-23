---
name: reels-con-ia
description: Guía paso a paso para conectar las cuentas y producir reels verticales con tu avatar y tu voz clonada. Claude orquesta y cada IA hace una parte: guion, voz (ElevenLabs), control (Whisper), avatar (Seedance), música (Suno), edición en código y revisión (Gemini). Usala para la puesta a punto o cuando pidan hacer un reel.
---

# Reels con IA

Te acompaña a dejar todo conectado y a hacer tu primer reel, y después cada reel nuevo. Es el mismo proceso que Paul de Lavallaz (@morfeolabs) usa para los suyos, armado para que lo sigas desde cero.

## Reglas que no se saltean

1. **El guion se aprueba antes de gastar.** Mientras haya cambios, sólo texto. No generes voz, video ni música hasta que la persona diga «aprobado».
2. **La voz se escucha antes del video.** Después de `voz.py` y `control.py`, pasale el audio a la persona y esperá su OK. El avatar es lo caro: una palabra mal dicha obliga a pagar la toma de nuevo.
3. **Cada gasto se avisa.** `avatar.py` muestra el costo y no genera sin `--si`. Pedí permiso antes de correrlo con `--si` y no lo repitas sin permiso si algo sale mal; primero revisá por qué.
4. **Sólo la cara y la voz de la persona**, o de alguien que le haya dado permiso por escrito.
5. **Nada se publica solo.** La skill entrega el video; la persona decide si lo sube.

## Dónde trabaja

Una carpeta de reels de la persona (por ejemplo `Documentos/Reels`). Los scripts se corren siempre desde ahí:

```
Reels/
├── .env            las claves (nunca se comparte ni se sube a GitHub)
├── yo/             foto.jpg, gestos.mp4 y el audio que usó para el clon
└── reels/AAAA-MM-DD-tema/
    ├── guion.md    tema, guion aprobado y CTA
    ├── voz.txt     el guion con las indicaciones de tono, tal cual se manda a ElevenLabs
    ├── voz.mp3 · palabras.json
    ├── tomas/      t1.mp4 (gancho), t2.mp4 (cierre)
    ├── musica/     opcion1.mp3, opcion2.mp3…
    ├── reel.html   la edición
    ├── final.mp4 · revision.md · costos.csv
```

## Qué hacer según el pedido

- **Primera vez o «dejá todo listo»:** seguí [puesta a punto](references/puesta-a-punto.md) de a un paso por vez, esperando que la persona termine cada uno. Cerrá con `revisar_cuentas.py` en verde.
- **«Hagamos un reel sobre…»:** seguí [el reel paso a paso](references/reel-paso-a-paso.md). Para escribir, leé [guion](references/guion.md); para editar, [edición](references/edicion.md).
- **Algo falló:** mostrá el error tal cual, explicá en una línea qué significa y proponé el arreglo. Si es un problema de saldo o de clave, mandá a la persona al panel de esa plataforma.

## Scripts

Todos están en `scripts/` de esta skill y leen las claves del `.env` de la carpeta de reels.

| Script | Para qué | Costo |
|---|---|---|
| `revisar_cuentas.py` | Herramientas, claves y archivos: qué falta | gratis |
| `clonar_voz.py` | Crea el clon instantáneo de la voz en ElevenLabs | del plan |
| `voz.py` | Voz del guion con Eleven v4 | del plan |
| `control.py` | Whisper transcribe, compara con el guion y guarda los tiempos | centavos |
| `avatar.py` | Toma del avatar con Seedance 2.5 vía Kie | ≈ US$ 0,33 por segundo |
| `musica.py` | Dos versiones instrumentales con Suno vía Kie | ≈ US$ 0,07 |
| `render.py` / `render-remotion.mjs` | Arma el video 9:16 vertical con Remotion (React + TypeScript + Tailwind @ 60fps) con la voz, timestamps y avatar SVG | gratis |
| `revision.py` | Gemini mira el video y lista los problemas | centavos |

Un reel de unos 40 segundos con dos tomas de avatar sale entre US$ 3 y 5. Casi todo es el avatar.
