"""Genera una toma de tu avatar hablando con Seedance 2.5 vía Kie: tu foto + tu video de gestos + un tramo de tu voz.
Es el paso caro (≈ US$ 0,33 por segundo a 720p). Sin --si sólo muestra lo que va a mandar y cuánto cuesta.
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/avatar.py --audio reels/mi-reel/voz.mp3 --desde 0 --hasta 6.8 \
       --out reels/mi-reel/tomas/t1.mp4 [--formato 9:16|16:9] [--resolucion 720p] [--prompt-file …] [--si]"""
import argparse, json, math, subprocess, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import cargar_env, clave, pedir, kie_subir, bajar, esperar, anotar_costo, carpeta_reel_de, KIE

CREDITOS_POR_S = {"480p": 30, "720p": 65, "1080p": 145}      # aproximado, medido en tomas reales
USD_POR_CREDITO = 0.005

PROMPT = """[Generation Goal]
The person in @Image 1 speaks to the camera in the place shown in @Image 1. They deliver the exact dialogue in @Audio 1 with their own natural, calm explanatory hand gestures, guided by @Video 1. They are talking from the very first frame.

[Reference Material Roles]
@Image 1 is the only visual authority for the person's face, proportions, hair, clothes and the location, including its lighting. Preserve them. The pose in the photo is not frozen: animate the person.
@Video 1 shows the SAME person. Use it only as a guide for the style of their hand gestures, head movements, eyebrows and natural blinks, at a contained amplitude: hands mostly between chest and waist, never covering the face. The lips do not copy @Video 1; they follow @Audio 1. Do not copy its framing.
@Audio 1 is the person's own voice reading this dialogue: "{texto}". Preserve every word, the accent, the speaking rate, emphases and pauses, with the lips synchronized to every syllable.

[Camera]
Medium shot at eye level, static camera with a very subtle handheld breathing, no cuts, no zoom.

[Avoid]
On-screen text, captions, logos, music, other people, changes of clothes or location, distorted hands, extra fingers."""


def es_hdr(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer",
                        "-of", "csv=p=0", str(video)], capture_output=True, text=True)
    return r.stdout.strip() in ("arib-std-b67", "smpte2084")


def a_sdr(video, destino):
    """Los iPhone graban en HDR: Seedance lo lee lavado. Se manda una copia SDR."""
    vf = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vf", vf, "-c:v", "libx264", "-crf", "16", "-an", str(destino)])
    if r.returncode != 0:
        sys.exit("Tu video de gestos está en HDR y este ffmpeg no puede pasarlo a SDR. Grabalo de nuevo con HDR apagado "
                 "(en iPhone: Ajustes, Cámara, Grabar video, Video HDR) o instalá ffmpeg con zimg.")
    return destino


ap = argparse.ArgumentParser()
ap.add_argument("--audio", required=True)
ap.add_argument("--desde", type=float, required=True)
ap.add_argument("--hasta", type=float, required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--foto")
ap.add_argument("--gestos")
ap.add_argument("--texto", help="lo que dice en ese tramo; si falta, sale de palabras.json")
ap.add_argument("--formato", default="9:16", choices=["9:16", "16:9", "1:1"])
ap.add_argument("--resolucion", default="720p", choices=["480p", "720p", "1080p"])
ap.add_argument("--prompt-file")
ap.add_argument("--si", action="store_true", help="confirmo el gasto")
a = ap.parse_args()

base = cargar_env()
out = pathlib.Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
foto = pathlib.Path(a.foto) if a.foto else next((p for p in (base / "yo").glob("foto.*")), None)
gestos = pathlib.Path(a.gestos) if a.gestos else base / "yo" / "gestos.mp4"
if not foto or not foto.exists() or not gestos.exists():
    sys.exit("Faltan yo/foto.jpg o yo/gestos.mp4 (o pasalos con --foto y --gestos).")

dur = max(4, min(15, math.ceil(a.hasta - a.desde + 0.2)))
texto = a.texto
if not texto:
    pj = pathlib.Path(a.audio).with_name("palabras.json")
    if pj.exists():
        texto = " ".join(w["w"].strip() for w in json.loads(pj.read_text()) if a.desde - 0.05 <= w["s"] < a.hasta)
prompt = pathlib.Path(a.prompt_file).read_text(encoding="utf-8") if a.prompt_file else PROMPT.format(texto=(texto or "").strip())
usd = dur * CREDITOS_POR_S[a.resolucion] * USD_POR_CREDITO
print(f"Toma de {dur} s a {a.resolucion}, {a.formato}. Tramo de voz {a.desde:.2f}–{a.hasta:.2f} s: «{(texto or '').strip()}»")
print(f"Costo estimado: US$ {usd:.2f} (Seedance 2.5 vía Kie).")
if not a.si:
    print("No generé nada. Si está bien, volvé a correr el mismo comando con --si.")
    sys.exit(0)

k = clave("KIE_API_KEY")
tmp = out.parent / "_tmp"; tmp.mkdir(exist_ok=True)
tramo = tmp / f"{out.stem}_voz.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a.desde), "-t", str(a.hasta - a.desde), "-i", a.audio,
                "-ac", "1", "-ar", "44100", str(tramo)], check=True)
if es_hdr(gestos):
    print("Tu video de gestos está en HDR: mando una copia SDR.")
    gestos = a_sdr(gestos, tmp / "gestos_sdr.mp4")

entrada = {"prompt": prompt, "generate_audio": True, "resolution": a.resolucion, "aspect_ratio": a.formato,
           "duration": dur, "output_format": "mp4",
           "reference_image_urls": [kie_subir(foto, k)], "reference_video_urls": [kie_subir(gestos, k)],
           "reference_audio_urls": [kie_subir(tramo, k)]}
st, r = pedir(f"{KIE}/jobs/createTask", json_body={"model": "bytedance/seedance-2-5", "input": entrada},
              headers={"Authorization": f"Bearer {k}"})
res = json.loads(r or b"{}")
if st != 200 or res.get("code") != 200:
    sys.exit(f"Kie no aceptó la toma ({st}): {str(res)[:400]}")
tid = res["data"]["taskId"]
(out.with_suffix(".tarea.json")).write_text(json.dumps({"taskId": tid, "input": entrada}, ensure_ascii=False, indent=1))
print(f"Tarea {tid} creada. Seedance tarda entre 3 y 15 minutos.")


def consulta():
    st, r = pedir(f"{KIE}/jobs/recordInfo?taskId={tid}", headers={"Authorization": f"Bearer {k}"}, timeout=60)
    d = (json.loads(r or b"{}").get("data") or {})
    if d.get("state") == "fail":
        sys.exit(f"Seedance falló: {d.get('failCode')} {d.get('failMsg')}")
    return d if d.get("state") == "success" else None


d = esperar("Seedance generando", consulta, intervalo=15)
urls = json.loads(d.get("resultJson") or "{}").get("resultUrls") or []
if not urls:
    sys.exit(f"Seedance terminó sin video: {str(d)[:300]}")
bajar(urls[0], out)
cred = d.get("creditsConsumed")
anotar_costo(carpeta_reel_de(out), "kie/seedance-2.5", f"{dur} s {a.resolucion} {a.formato}", cred * USD_POR_CREDITO if cred else usd)
print(f"✓ {out}" + (f" · {cred} créditos = US$ {cred * USD_POR_CREDITO:.2f}" if cred else ""))
