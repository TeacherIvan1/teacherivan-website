import glob
import json
import os
import subprocess
import sys
import time

# 1. Resolve router path with glob rather than hardcoding version
def find_router_exe():
    import platform
    appdata = os.environ.get("APPDATA", "")
    is_arm = platform.machine().lower() in ("arm64", "aarch64")
    preferred_arch = "win-arm64" if is_arm else "win-x64"
    patterns = [
        os.path.join(appdata, "McNeel", "Rhinoceros", "packages", "*", "Rhino-MCP-Platform", "*", "router", preferred_arch, "rhino-mcp-router.exe"),
        os.path.join(appdata, "McNeel", "Rhinoceros", "ai", "bin", "rhino-mcp-router.exe")
    ]
    candidates = []
    for pat in patterns:
        matches = glob.glob(pat)
        candidates.extend(matches)
    if not candidates:
        raise FileNotFoundError(f"Could not find rhino-mcp-router.exe for {preferred_arch} in APPDATA")
    # Sort by modification time, newest first
    candidates.sort(key=os.path.getmtime, reverse=True)
    return candidates[0]

# 2. Embedded Rhino diagnostic script
rhino_diagnostic_script = """import Rhino
import Rhino.Geometry as rg
import json

doc = __rhino_doc__
layers = [doc.Layers[i].FullPath for i in range(doc.Layers.Count) if not doc.Layers[i].IsDeleted]

layer_counts = {lyr: 0 for lyr in layers}
type_counts = {}
bbox = rg.BoundingBox.Empty

for obj in doc.Objects:
    lyr_name = doc.Layers[obj.Attributes.LayerIndex].FullPath
    layer_counts[lyr_name] = layer_counts.get(lyr_name, 0) + 1
    
    t_name = str(obj.ObjectType)
    type_counts[t_name] = type_counts.get(t_name, 0) + 1
    
    g = obj.Geometry
    if g:
        bb = g.GetBoundingBox(True)
        if bb.IsValid:
            if bbox.IsValid:
                bbox = rg.BoundingBox.Union(bbox, bb)
            else:
                bbox = bb

bbox_dict = None
if bbox.IsValid:
    bbox_dict = {
        "min": [round(bbox.Min.X, 3), round(bbox.Min.Y, 3), round(bbox.Min.Z, 3)],
        "max": [round(bbox.Max.X, 3), round(bbox.Max.Y, 3), round(bbox.Max.Z, 3)],
        "dimensions": [round(bbox.Max.X - bbox.Min.X, 3), round(bbox.Max.Y - bbox.Min.Y, 3), round(bbox.Max.Z - bbox.Min.Z, 3)]
    }

diag = {
    "document_name": doc.Name if doc.Name else "Untitled / Unsaved",
    "document_path": doc.Path if (hasattr(doc, "Path") and doc.Path) else None,
    "unit_system": str(doc.ModelUnitSystem),
    "tolerance": doc.ModelAbsoluteTolerance,
    "total_objects": doc.Objects.Count,
    "layers": layers,
    "layer_object_counts": layer_counts,
    "object_type_counts": type_counts,
    "bounding_box": bbox_dict
}

print(json.dumps(diag, indent=2))
"""

def read_response(proc, req_id, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        line = proc.stdout.readline()
        if not line:
            if proc.poll() is not None:
                raise RuntimeError(f"Router process terminated unexpectedly with code {proc.returncode}")
            time.sleep(0.05)
            continue
        try:
            msg = json.loads(line.strip())
        except json.JSONDecodeError:
            continue
        if msg.get("id") == req_id:
            if "error" in msg:
                raise RuntimeError(f"JSON-RPC error: {msg['error']}")
            return msg
    raise TimeoutError(f"Timed out after {timeout}s waiting for JSON-RPC response with id={req_id}")

def run_diagnostic(slot=None):
    router_exe = find_router_exe()
    cmd = [router_exe, "--default-version", "8"]

    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        encoding="utf-8",
        bufsize=1
    )

    try:
        def send_msg(msg):
            proc.stdin.write(json.dumps(msg) + "\n")
            proc.stdin.flush()

        # 1. Initialize
        send_msg({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "run_diagnostic_doc", "version": "1.0"}
            }
        })
        init_res = read_response(proc, 1)

        send_msg({
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {}
        })

        # 2. Call run_python
        call_args = {"script": rhino_diagnostic_script}
        if slot:
            call_args["slot"] = slot

        send_msg({
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "run_python",
                "arguments": call_args
            }
        })
        call_res = read_response(proc, 2, timeout=45)

        result = call_res.get("result", {})
        if result.get("isError"):
            raise RuntimeError(f"Tool execution failed: {result}")

        content_list = result.get("content", [])
        if not content_list:
            raise RuntimeError("Empty content returned from run_python")

        raw_payload = content_list[0].get("text", "")
        
        # Extract JSON object if there are preceding command window lines (e.g. Autosave)
        json_start = raw_payload.find("{")
        json_end = raw_payload.rfind("}")
        if json_start != -1 and json_end != -1 and json_end > json_start:
            try:
                parsed_payload = json.loads(raw_payload[json_start : json_end + 1])
            except json.JSONDecodeError:
                parsed_payload = raw_payload
        else:
            try:
                parsed_payload = json.loads(raw_payload)
            except json.JSONDecodeError:
                parsed_payload = raw_payload

        # Check if the inner payload itself was an execution error
        if isinstance(parsed_payload, dict) and parsed_payload.get("error") == "Failed":
            raise RuntimeError(f"Rhino script error: {parsed_payload.get('message')}")

        return parsed_payload

    finally:
        try:
            proc.stdin.close()
        except:
            pass
        try:
            proc.terminate()
            proc.wait(timeout=2)
        except:
            proc.kill()

if __name__ == "__main__":
    slot_id = sys.argv[1] if len(sys.argv) > 1 else "aardvark"
    try:
        output = run_diagnostic(slot=slot_id)
        print(json.dumps(output, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)
