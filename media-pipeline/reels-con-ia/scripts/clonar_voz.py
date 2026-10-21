"""Crea tu clon de voz instantáneo en ElevenLabs a partir de uno o más audios tuyos y guarda el ID en .env.
Necesitás un plan pago de ElevenLabs (Starter o superior). Audio limpio: sin música, sin eco, 1 a 3 minutos en total.
Si ya creaste tu voz desde elevenlabs.io (incluido el clon profesional), no hace falta: copiá su ID a ELEVENLABS_VOICE_ID.
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/clonar_voz.py yo/voz.mp3 [otro.mp3 …] --nombre "Mi voz" """
import argparse, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import cargar_env, clave, pedir, multipart

ap = argparse.ArgumentParser()
ap.add_argument("audios", nargs="+")
ap.add_argument("--nombre", default="Mi voz para reels")
a = ap.parse_args()
base = cargar_env()
k = clave("ELEVENLABS_API_KEY")
body, ctype = multipart({"name": a.nombre, "remove_background_noise": "true"}, [("files", p) for p in a.audios])
st, r = pedir("https://api.elevenlabs.io/v1/voices/add", datos=body, headers={"xi-api-key": k, "Content-Type": ctype}, timeout=300)
if st != 200:
    sys.exit(f"ElevenLabs no creó la voz ({st}): {r[:400].decode(errors='ignore')}")
vid = json.loads(r)["voice_id"]
env = base / ".env"
lineas = [l for l in (env.read_text().splitlines() if env.exists() else []) if not l.startswith("ELEVENLABS_VOICE_ID=")]
env.write_text("\n".join(lineas + [f"ELEVENLABS_VOICE_ID={vid}"]) + "\n")
print(f"✓ Voz creada: {a.nombre}. Guardé su ID en .env como ELEVENLABS_VOICE_ID.")
