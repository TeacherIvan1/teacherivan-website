"""Pide a Suno (vía Kie) una música instrumental. Cada pedido devuelve dos versiones: opcion1.mp3 y opcion2.mp3.
Para comparar estilos distintos, hacé dos pedidos con --estilo distinto. Cuesta centavos (≈ US$ 0,07 por pedido).
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/musica.py --estilo "acid techno, 128 BPM, driving, instrumental" \
       --descripcion "groove nocturno para un video de tecnología" --out reels/mi-reel/musica/"""
import argparse, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _comun import clave, pedir, bajar, esperar, anotar_costo, carpeta_reel_de, KIE

ap = argparse.ArgumentParser()
ap.add_argument("--estilo", required=True, help="género, BPM y energía; siempre instrumental")
ap.add_argument("--descripcion", required=True, help="qué tiene que transmitir, en una o dos frases")
ap.add_argument("--titulo", default="Cama para reel")
ap.add_argument("--out", required=True, help="carpeta de salida")
ap.add_argument("--prefijo", default="opcion")
a = ap.parse_args()

k = clave("KIE_API_KEY")
cuerpo = {"model": "V4_5PLUS", "title": a.titulo, "style": a.estilo, "prompt": a.descripcion, "instrumental": True,
          "customMode": True, "callBackUrl": "https://httpbin.org/post",
          "negativeTags": "vocals, singing, rap, loud lead melody, cinematic trailer drama"}
st, r = pedir(f"{KIE}/generate", json_body=cuerpo, headers={"Authorization": f"Bearer {k}"})
res = json.loads(r or b"{}")
tid = (res.get("data") or {}).get("taskId")
if st != 200 or not tid:
    sys.exit(f"Suno no aceptó el pedido ({st}): {str(res)[:400]}")
print(f"Pedido {tid}. Suno tarda uno o dos minutos.")


def consulta():
    st, r = pedir(f"{KIE}/generate/record-info?taskId={tid}", headers={"Authorization": f"Bearer {k}"}, timeout=60)
    d = json.loads(r or b"{}").get("data") or {}
    estado = str(d.get("status") or "").upper()
    if estado in {"FAILED", "ERROR", "SENSITIVE_WORD_ERROR", "FAIL"}:
        sys.exit(f"Suno falló: {estado} {str(d)[:300]}")
    temas = ((d.get("response") or {}).get("sunoData") or [])
    return temas if estado in {"SUCCESS", "SUCCEEDED", "COMPLETED"} and temas else None


temas = esperar("Suno componiendo", consulta, intervalo=6, limite=900)
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
for i, t in enumerate(temas[:2], 1):
    f = bajar(t.get("audioUrl") or t.get("streamAudioUrl"), out / f"{a.prefijo}{i}.mp3")
    print(f"✓ {f} ({t.get('duration') or '?'} s)")
(out / f"{a.prefijo}.json").write_text(json.dumps({"taskId": tid, "pedido": cuerpo}, ensure_ascii=False, indent=1))
anotar_costo(carpeta_reel_de(out), "kie/suno", a.estilo, 0.07)
