"""Funciones compartidas por los scripts de reels-con-ia. Sin dependencias fuera de la biblioteca estándar de Python.

Las claves se leen del archivo .env de tu carpeta de reels (la carpeta desde donde corrés los scripts, o una de sus
carpetas madre). Nunca se imprimen."""
import json, os, pathlib, sys, time, uuid, urllib.request, urllib.error, mimetypes, hashlib, datetime

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def carpeta_de_trabajo() -> pathlib.Path:
    """La carpeta que tiene el .env: la actual o la primera madre que lo tenga."""
    p = pathlib.Path.cwd().resolve()
    for d in [p, *p.parents]:
        if (d / ".env").exists():
            return d
    return p


def cargar_env() -> pathlib.Path:
    base = carpeta_de_trabajo()
    env = base / ".env"
    if env.exists():
        for linea in env.read_text(errors="ignore").splitlines():
            linea = linea.strip()
            if linea and not linea.startswith("#") and "=" in linea:
                k, v = linea.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return base


def clave(nombre: str) -> str:
    cargar_env()
    v = os.environ.get(nombre, "").strip()
    if not v:
        sys.exit(f"Falta {nombre} en el archivo .env de tu carpeta de reels. Agregalo como {nombre}=tu_clave y volvé a correr.")
    return v


def pedir(url, *, datos=None, json_body=None, headers=None, metodo=None, timeout=120):
    """HTTP con urllib. Devuelve (status, bytes). No levanta excepción por errores HTTP."""
    h = {"User-Agent": UA, **(headers or {})}
    if json_body is not None:
        datos = json.dumps(json_body).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=datos, headers=h, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def multipart(campos: dict, archivos: list):
    """campos: {nombre: valor}; archivos: [(campo, ruta)] o [(campo, ruta, nombre_remoto)]. Devuelve (body, content_type)."""
    limite = "----reelsconia" + uuid.uuid4().hex
    partes = []
    for k, v in campos.items():
        partes.append(f'--{limite}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for item in archivos:
        campo, ruta = item[0], pathlib.Path(item[1])
        nombre = item[2] if len(item) > 2 else ruta.name
        mime = mimetypes.guess_type(ruta.name)[0] or "application/octet-stream"
        partes.append(f'--{limite}\r\nContent-Disposition: form-data; name="{campo}"; filename="{nombre}"\r\n'
                      f"Content-Type: {mime}\r\n\r\n".encode())
        partes.append(ruta.read_bytes())
        partes.append(b"\r\n")
    partes.append(f"--{limite}--\r\n".encode())
    return b"".join(partes), f"multipart/form-data; boundary={limite}"


def bajar(url: str, destino: pathlib.Path):
    destino.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=600) as r:
        destino.write_bytes(r.read())
    return destino


# ---------- Kie.ai (Seedance y Suno) ----------
KIE = "https://api.kie.ai/api/v1"
KIE_UPLOAD = "https://kieai.redpandaai.co/api/file-stream-upload"


def kie_subir(ruta, key: str) -> str:
    """Sube un archivo local a Kie y devuelve su URL. El nombre lleva un hash para no pisar archivos con el mismo nombre."""
    ruta = pathlib.Path(ruta)
    nombre = f"{hashlib.md5(ruta.read_bytes()).hexdigest()[:8]}-{ruta.name}"
    body, ctype = multipart({"uploadPath": "reels-con-ia", "fileName": nombre}, [("file", ruta, nombre)])
    st, r = pedir(KIE_UPLOAD, datos=body, headers={"Content-Type": ctype, "Authorization": f"Bearer {key}", "User-Agent": "curl/8.7.1"}, timeout=600)
    res = json.loads(r or b"{}")
    if st != 200 or not res.get("success"):
        sys.exit(f"No se pudo subir {ruta.name} a Kie ({st}): {str(res)[:300]}")
    return res["data"]["downloadUrl"]


# ---------- registro de costos ----------
def anotar_costo(carpeta_reel, servicio: str, detalle: str, usd: float | None):
    """Suma una línea a costos.csv de la carpeta del reel. usd=None si el servicio no informa el costo."""
    if carpeta_reel is None:
        return
    f = pathlib.Path(carpeta_reel) / "costos.csv"
    nuevo = not f.exists()
    with f.open("a", encoding="utf-8") as fh:
        if nuevo:
            fh.write("fecha,servicio,detalle,usd\n")
        fh.write(f'{datetime.datetime.now():%Y-%m-%d %H:%M},{servicio},"{detalle}",{"" if usd is None else round(usd, 4)}\n')


def carpeta_reel_de(ruta) -> pathlib.Path | None:
    """La carpeta del reel es la que contiene guion.md, subiendo desde la ruta dada."""
    p = pathlib.Path(ruta).resolve()
    for d in [p if p.is_dir() else p.parent, *p.parents]:
        if (d / "guion.md").exists():
            return d
    return None


def esperar(titulo: str, consulta, intervalo=8, limite=2400):
    """Llama a consulta() hasta que devuelva algo distinto de None. Muestra el avance."""
    t0 = time.time()
    while time.time() - t0 < limite:
        r = consulta()
        if r is not None:
            return r
        print(f"  {titulo}… {int(time.time() - t0)} s", flush=True)
        time.sleep(intervalo)
    sys.exit(f"{titulo}: se pasó el tiempo de espera ({limite} s).")
