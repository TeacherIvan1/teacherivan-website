"""Transcribe la voz con Whisper y la compara palabra por palabra con el guion. Guarda palabras.json con el tiempo de
cada palabra (sirve para los subtítulos y para cortar los tramos del avatar).
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/control.py reels/mi-reel/voz.mp3 --guion reels/mi-reel/voz.txt"""
import argparse, difflib, json, re, sys, unicodedata, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import clave, pedir, multipart, anotar_costo, carpeta_reel_de


def tokens(t):
    t = re.sub(r"\[[^\]]*\]", " ", t)                     # fuera las indicaciones de tono
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z0-9ñ]+", t)


ap = argparse.ArgumentParser()
ap.add_argument("audio")
ap.add_argument("--guion", required=True)
ap.add_argument("--idioma", default="es")
a = ap.parse_args()

k = clave("OPENAI_API_KEY")
body, ctype = multipart({"model": "whisper-1", "language": a.idioma, "response_format": "verbose_json",
                         "timestamp_granularities[]": "word"}, [("file", a.audio)])
st, r = pedir("https://api.openai.com/v1/audio/transcriptions", datos=body,
              headers={"Authorization": f"Bearer {k}", "Content-Type": ctype}, timeout=300)
if st != 200:
    sys.exit(f"Whisper devolvió {st}: {r[:400].decode(errors='ignore')}")
d = json.loads(r)
palabras = [{"w": w["word"], "s": round(w["start"], 3), "e": round(w["end"], 3)} for w in d.get("words", [])]
salida = pathlib.Path(a.audio).with_name("palabras.json")
salida.write_text(json.dumps(palabras, ensure_ascii=False, indent=1))
anotar_costo(carpeta_reel_de(a.audio), "openai", "whisper-1", round(d.get("duration", 0) / 60 * 0.006, 4))

g, o = tokens(pathlib.Path(a.guion).read_text(encoding="utf-8")), tokens(d.get("text", ""))
cambios = [(op, " ".join(g[i1:i2]), " ".join(o[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, g, o).get_opcodes() if op != "equal"]
print(f"Whisper escuchó: {d.get('text', '').strip()}\nDuración: {d.get('duration', 0):.1f} s · {len(palabras)} palabras con tiempo en {salida.name}\n")
if not cambios:
    print("✓ Dice exactamente el guion.")
else:
    print(f"Diferencias con el guion ({len(cambios)}). Whisper suele escribir mal los nombres propios (Claude → Cloud): esas no cuentan.")
    for op, guion, oido in cambios:
        print(f"  - guion: «{guion or '—'}»  ·  se escuchó: «{oido or '—'}»")
