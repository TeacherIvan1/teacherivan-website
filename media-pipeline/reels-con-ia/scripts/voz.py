"""Genera la voz del reel con tu clon de ElevenLabs (modelo Eleven v4).
El texto puede llevar indicaciones de tono entre corchetes, por ejemplo: [relaxed, confident] Hoy te muestro…
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/voz.py reels/mi-reel/voz.txt --out reels/mi-reel/voz.mp3
     [--modelo eleven_v4] [--estabilidad 0.5] [--seed 7]"""
import argparse, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import clave, pedir, anotar_costo, carpeta_reel_de

ap = argparse.ArgumentParser()
ap.add_argument("texto")
ap.add_argument("--out", required=True)
ap.add_argument("--modelo", default="eleven_v4")
ap.add_argument("--idioma", default="es")
ap.add_argument("--estabilidad", type=float, default=0.5)
ap.add_argument("--seed", type=int, default=7)
a = ap.parse_args()

k, voz = clave("ELEVENLABS_API_KEY"), clave("ELEVENLABS_VOICE_ID")
texto = pathlib.Path(a.texto).read_text(encoding="utf-8").strip()
cuerpo = {"model_id": a.modelo, "text": texto, "language_code": a.idioma,
          "voice_settings": {"stability": a.estabilidad}, "seed": a.seed}
st, r = pedir(f"https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_192",
              json_body=cuerpo, headers={"xi-api-key": k, "Accept": "audio/mpeg"}, timeout=300)
if st != 200:
    sys.exit(f"ElevenLabs devolvió {st}: {r[:400].decode(errors='ignore')}")
out = pathlib.Path(a.out); out.parent.mkdir(parents=True, exist_ok=True); out.write_bytes(r)
anotar_costo(carpeta_reel_de(out), "elevenlabs", f"{a.modelo}, {len(texto)} caracteres (créditos del plan)", None)
print(f"✓ {out} ({out.stat().st_size // 1024} KB). Escuchalo y controlalo con control.py antes de seguir.")
