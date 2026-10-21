# Puesta a punto

Guiá a la persona de a un paso por vez. Después de cada paso, esperá que confirme antes de seguir. Explicá para qué sirve cada cosa en una frase. Nunca le pidas que te pegue una clave en el chat: que la escriba ella en el `.env`.

## 1. La carpeta de reels

Creá la carpeta (si no dice dónde, `~/Documents/Reels`) con `yo/`, `reels/` y un `.env` copiado de `plantillas/.env.ejemplo`. Si usa Git, agregá `.env` a `.gitignore`.

## 2. Las herramientas de la compu

Corré `python3 scripts/revisar_cuentas.py` desde la carpeta (con la ruta completa de la skill) y resolvé lo que falte:

- **Mac:** `xcode-select --install`; Homebrew desde brew.sh si no lo tiene; `brew install ffmpeg`; `python3 -m pip install --user playwright numpy` y `python3 -m playwright install chromium`.
- **Windows:** Python desde python.org (tildar «Add python.exe to PATH»), ffmpeg desde ffmpeg.org (o `winget install ffmpeg`), y después `py -m pip install --user playwright numpy` y `py -m playwright install chromium`.
- **Linux:** lo mismo con el gestor de paquetes.

## 3. Las cuentas y sus claves

De a una. Para cada una: qué es, cómo se crea la clave y en qué renglón del `.env` va.

1. **ElevenLabs** (elevenlabs.io): la voz. Para clonar la voz hace falta un plan pago (Starter alcanza para el clon instantáneo; Creator, para el profesional). Clave: el ícono de la cuenta, «API Keys», «Create». Va en `ELEVENLABS_API_KEY`.
2. **OpenAI** (platform.openai.com): Whisper, para controlar la voz. «API keys», «Create new secret key», y cargar unos dólares de saldo en «Billing». Va en `OPENAI_API_KEY`.
3. **Kie.ai** (kie.ai): una sola cuenta para Seedance (el avatar) y Suno (la música). «API Key» en el panel y saldo cargado: con US$ 10 sobra para los primeros reels. Va en `KIE_API_KEY`.
4. **Google AI Studio** (aistudio.google.com): Gemini, para revisar el video. «Get API key», «Create API key». Va en `GEMINI_API_KEY`.

Después de cada clave, volvé a correr `revisar_cuentas.py`: confirma que anda sin gastar nada.

## 4. Sus archivos

- **`yo/foto.jpg`:** plano medio, de frente, mirando a cámara, buena luz, en el lugar donde quiere aparecer y con la ropa que va a usar. Es la referencia de la cara y del lugar.
- **`yo/gestos.mp4`:** 5 a 10 segundos hablando de cualquier cosa, mismo lugar y ropa, cámara fija, manos a la altura del pecho. En iPhone, mejor con el HDR apagado (Ajustes, Cámara, Grabar video); si viene en HDR, `avatar.py` manda una copia corregida.
- **Su voz:** 1 a 3 minutos leyendo algo en su tono normal, sin música ni eco (una nota de voz en un lugar callado alcanza). Guardala como `yo/voz.mp3` y corré `clonar_voz.py yo/voz.mp3 --nombre "…"`: crea el clon y guarda `ELEVENLABS_VOICE_ID`. Si ya tiene un clon hecho desde la web de ElevenLabs, alcanza con copiar su ID.

## 5. Listo

`revisar_cuentas.py` todo en verde. Proponé hacer el primer reel con un tema que la persona domine: «¿De qué querés que hable tu primer reel?».
