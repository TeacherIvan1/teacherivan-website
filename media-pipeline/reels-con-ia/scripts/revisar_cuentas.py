"""Revisa que esté todo listo para hacer reels: herramientas de la compu, claves de cada plataforma y tus archivos.
Usa sólo llamadas gratuitas (consultar la cuenta o la lista de modelos): no gasta saldo.
Uso (desde tu carpeta de reels): python3 ~/.claude/skills/reels-con-ia/scripts/revisar_cuentas.py"""
import json, os, shutil, subprocess, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import cargar_env, pedir

base = cargar_env()
ok_total = True


def linea(ok, que, detalle=""):
    global ok_total
    ok_total &= bool(ok)
    print(f"{'✓' if ok else '✗'} {que}" + (f" · {detalle}" if detalle else ""))


print(f"Carpeta de reels: {base}\n\nHerramientas")
linea(sys.version_info >= (3, 9), "Python", sys.version.split()[0])
linea(shutil.which("ffmpeg") is not None, "ffmpeg", "" if shutil.which("ffmpeg") else "falta: en Mac, brew install ffmpeg")
try:
    import playwright  # noqa: F401
    r = subprocess.run([sys.executable, "-c", "from playwright.sync_api import sync_playwright\nwith sync_playwright() as p: b=p.chromium.launch(); b.close()"],
                       capture_output=True, text=True, timeout=90)
    linea(r.returncode == 0, "Playwright con Chromium", "" if r.returncode == 0 else "falta el navegador: python3 -m playwright install chromium")
except ImportError:
    linea(False, "Playwright", "falta: python3 -m pip install --user playwright y después python3 -m playwright install chromium")

print("\nCuentas")
k = os.environ.get("ELEVENLABS_API_KEY")
if k:
    st, b = pedir("https://api.elevenlabs.io/v1/user", headers={"xi-api-key": k})
    plan = json.loads(b).get("subscription", {}).get("tier", "?") if st == 200 else ""
    linea(st == 200, "ElevenLabs", f"plan {plan}" if st == 200 else f"la clave no anda ({st})")
    v = os.environ.get("ELEVENLABS_VOICE_ID")
    if v:
        st, b = pedir(f"https://api.elevenlabs.io/v1/voices/{v}", headers={"xi-api-key": k})
        linea(st == 200, "Tu voz clonada", json.loads(b).get("name", "") if st == 200 else "no encuentro ese ELEVENLABS_VOICE_ID")
    else:
        linea(False, "Tu voz clonada", "falta ELEVENLABS_VOICE_ID: creala con clonar_voz.py o desde elevenlabs.io")
else:
    linea(False, "ElevenLabs", "falta ELEVENLABS_API_KEY")

k = os.environ.get("OPENAI_API_KEY")
if k:
    st, _ = pedir("https://api.openai.com/v1/models/whisper-1", headers={"Authorization": f"Bearer {k}"})
    linea(st == 200, "OpenAI (Whisper)", "" if st == 200 else f"la clave no anda ({st})")
else:
    linea(False, "OpenAI (Whisper)", "falta OPENAI_API_KEY")

k = os.environ.get("KIE_API_KEY")
if k:
    st, b = pedir("https://api.kie.ai/api/v1/chat/credit", headers={"Authorization": f"Bearer {k}"})
    try:
        d = json.loads(b)
    except Exception:
        d = {}
    creditos = d.get("data") if isinstance(d.get("data"), (int, float)) else None
    ok = st == 200 and d.get("code") == 200
    linea(ok, "Kie.ai (Seedance y Suno)", (f"{creditos} créditos ≈ US$ {creditos * 0.005:.2f}" if creditos is not None else "") if ok else f"la clave no anda ({st})")
    if ok and creditos is not None and creditos < 500:
        print("  ! Cargá saldo en kie.ai: una toma de avatar de 7 s usa unos 456 créditos.")
else:
    linea(False, "Kie.ai (Seedance y Suno)", "falta KIE_API_KEY")

k = os.environ.get("GEMINI_API_KEY")
if k:
    st, _ = pedir("https://generativelanguage.googleapis.com/v1beta/models", headers={"x-goog-api-key": k})
    linea(st == 200, "Google AI Studio (Gemini)", "" if st == 200 else f"la clave no anda ({st})")
else:
    linea(False, "Google AI Studio (Gemini)", "falta GEMINI_API_KEY")

print("\nTus archivos (carpeta yo/)")
yo = base / "yo"
foto = next((p for p in yo.glob("foto.*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")), None) if yo.exists() else None
linea(foto is not None, "Foto tuya", foto.name if foto else "falta yo/foto.jpg: plano medio, de frente, buena luz, en tu espacio")
gestos = (yo / "gestos.mp4") if (yo / "gestos.mp4").exists() else None
linea(gestos is not None, "Video de gestos", "gestos.mp4" if gestos else "falta yo/gestos.mp4: 5 a 10 s hablando con las manos")

print("\n" + ("Todo listo para hacer tu primer reel." if ok_total else "Resolvé lo marcado con ✗ y volvé a correr este chequeo."))
sys.exit(0 if ok_total else 1)
