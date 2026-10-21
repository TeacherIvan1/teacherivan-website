"""Renderiza el reel: recorre reel.html cuadro a cuadro (seek(t)), lo pasa a video y le suma la voz y la música.
Antes convierte las tomas de tomas/*.mp4 a .webm (el navegador del render no lee H.264).
Uso: python3 ~/.claude/skills/reels-con-ia/scripts/render.py reels/mi-reel [--musica musica/opcion1.mp3] [--vol-musica -18]
     [--muestras 1,8,20]   sólo saca cuadros de prueba en muestras/ para revisar antes del render completo"""
import argparse, json, shutil, subprocess, sys, pathlib
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("reel")
ap.add_argument("--musica")
ap.add_argument("--vol-musica", type=float, default=-18, help="dB de la música respecto de la voz")
ap.add_argument("--fps", type=int, default=30)
ap.add_argument("--muestras")
a = ap.parse_args()
R = pathlib.Path(a.reel).resolve()
html, voz = R / "reel.html", R / "voz.mp3"
if not html.exists():
    sys.exit(f"No encuentro {html}. Copiá la plantilla de la skill (plantillas/reel.html) a la carpeta del reel.")

for mp4 in sorted((R / "tomas").glob("*.mp4")):
    webm = mp4.with_suffix(".webm")
    if not webm.exists() or webm.stat().st_mtime < mp4.stat().st_mtime:
        print(f"convirtiendo {mp4.name} a webm…")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp4), "-an", "-vf", "fps=30", "-c:v", "libvpx-vp9",
                        "-b:v", "3M", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", str(webm)], check=True)

palabras = json.loads((R / "palabras.json").read_text()) if (R / "palabras.json").exists() else []
frames = R / "_cuadros"; shutil.rmtree(frames, ignore_errors=True); frames.mkdir()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
    errores = []; pg.on("pageerror", lambda e: errores.append(str(e)))
    pg.goto(html.as_uri()); pg.evaluate(f"window.PALABRAS = {json.dumps(palabras)}"); pg.evaluate("window.listo()"); pg.wait_for_timeout(300)
    if errores:
        sys.exit("Error en reel.html: " + errores[0])
    dur = pg.evaluate("CONFIG.DURACION"); el = pg.query_selector("#reel")
    if a.muestras:
        out = R / "muestras"; out.mkdir(exist_ok=True)
        for s in a.muestras.split(","):
            pg.evaluate(f"seek({float(s)})"); el.screenshot(path=str(out / f"t{float(s):05.1f}.png"))
        print(f"✓ cuadros de prueba en {out}"); b.close(); shutil.rmtree(frames); sys.exit(0)
    n = int(round(dur * a.fps))
    for i in range(n):
        pg.evaluate(f"seek({i / a.fps})"); el.screenshot(path=str(frames / f"f{i:05d}.jpg"), type="jpeg", quality=92)
        if i % (a.fps * 5) == 0:
            print(f"  {i / a.fps:.0f} / {dur:.0f} s", flush=True)
    b.close()

final = R / "final.mp4"
cmd = ["ffmpeg", "-v", "error", "-y", "-framerate", str(a.fps), "-i", str(frames / "f%05d.jpg")]
filtro, mapa = [], ["-map", "0:v"]
if voz.exists():
    cmd += ["-i", str(voz)]
    if a.musica:
        cmd += ["-i", a.musica]
        filtro = [f"[2:a]volume={a.vol_musica}dB,afade=t=out:st={max(0, dur - 1.5)}:d=1.5[m];[1:a][m]amix=inputs=2:duration=first:normalize=0,"
                  f"loudnorm=I=-14:TP=-1.5[a]"]
    else:
        filtro = ["[1:a]loudnorm=I=-14:TP=-1.5[a]"]
    mapa += ["-map", "[a]"]
cmd += (["-filter_complex", filtro[0]] if filtro else []) + mapa + ["-t", str(dur), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(final)]
subprocess.run(cmd, check=True)
shutil.rmtree(frames)
print(f"✓ {final}")
