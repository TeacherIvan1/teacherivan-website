"""Gemini mira el reel terminado y lista los problemas con su segundo. Cuesta centavos.
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/revision.py reels/mi-reel/final.mp4 [--guion reels/mi-reel/voz.txt]
     [--modelo gemini-3.8-flash]   (o GEMINI_MODEL en .env)"""
import argparse, json, os, sys, time, pathlib, urllib.request
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import clave, pedir, anotar_costo, carpeta_reel_de

G = "https://generativelanguage.googleapis.com"
PEDIDO = """Sos editor de reels verticales. Mirá y escuchá el video entero y listá sólo problemas concretos, cada uno con
su segundo (mm:ss) y cómo arreglarlo. Revisá:
- que la boca del avatar vaya con la voz (decí si la imagen va adelantada o atrasada);
- textos que se salen del cuadro, se cortan, se tapan o tienen errores de ortografía;
- subtítulos que no coinciden con lo que se dice;
- cortes bruscos, cuadros negros o en blanco, saltos de imagen;
- música que tapa la voz o termina de golpe;
- que el gancho de los primeros 3 segundos se entienda sin sonido.
{extra}
Si no hay problemas en un punto, no lo menciones. Terminá con una línea: «Listo para publicar» o «Hay que corregir»."""

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("--guion")
ap.add_argument("--modelo", default=None)
a = ap.parse_args()
k = clave("GEMINI_API_KEY")
modelo = a.modelo or os.environ.get("GEMINI_MODEL") or "gemini-3.8-flash"
v = pathlib.Path(a.video); n = v.stat().st_size

req = urllib.request.Request(f"{G}/upload/v1beta/files", data=json.dumps({"file": {"display_name": v.name}}).encode(), method="POST",
                             headers={"x-goog-api-key": k, "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
                                      "X-Goog-Upload-Header-Content-Length": str(n), "X-Goog-Upload-Header-Content-Type": "video/mp4",
                                      "Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=120) as resp:
    url_subida = resp.headers.get("x-goog-upload-url")
st, r = pedir(url_subida, datos=v.read_bytes(), headers={"Content-Length": str(n), "X-Goog-Upload-Offset": "0",
                                                         "X-Goog-Upload-Command": "upload, finalize"}, timeout=600)
if st != 200:
    sys.exit(f"No se pudo subir el video a Gemini ({st}): {r[:300].decode(errors='ignore')}")
archivo = json.loads(r)["file"]
for _ in range(60):
    if archivo.get("state") == "ACTIVE":
        break
    time.sleep(3)
    st, r = pedir(f"{G}/v1beta/{archivo['name']}", headers={"x-goog-api-key": k})
    archivo = json.loads(r)
extra = f"El guion es este; marcá cualquier diferencia con lo que se dice:\n{pathlib.Path(a.guion).read_text(encoding='utf-8')}" if a.guion else ""
cuerpo = {"contents": [{"parts": [{"file_data": {"mime_type": "video/mp4", "file_uri": archivo["uri"]}},
                                  {"text": PEDIDO.format(extra=extra)}]}]}
st, r = pedir(f"{G}/v1beta/models/{modelo}:generateContent", json_body=cuerpo, headers={"x-goog-api-key": k}, timeout=600)
if st != 200:
    sys.exit(f"Gemini devolvió {st}: {r[:400].decode(errors='ignore')}. Si el modelo no existe, pasá otro con --modelo.")
d = json.loads(r)
texto = "".join(p.get("text", "") for p in d["candidates"][0]["content"]["parts"])
salida = v.with_name("revision.md"); salida.write_text(texto)
u = d.get("usageMetadata", {})
anotar_costo(carpeta_reel_de(v), "gemini", f"{modelo}, {u.get('totalTokenCount', '?')} tokens", None)
print(texto)
print(f"\n(guardado en {salida})")
