import os
import shutil
import numpy as np
from PIL import Image
from scipy import ndimage

SRC_IVAN = r"C:\Users\clubp\Downloads\teacherivan-3dmodel.png"
SRC_EMMA = r"C:\Users\clubp\Downloads\emma-3dmodel.jpg"

OUT_CLIENT = r"client\public\assets\avatars"
OUT_ASSETS = r"Assets\avatars"
OUT_MEDIA = r"media-pipeline\public\assets\avatars"
QA_DIR = r"media-pipeline\output\qa-3d-planet"

for d in [OUT_CLIENT, OUT_ASSETS, OUT_MEDIA, QA_DIR]:
    os.makedirs(d, exist_ok=True)


def extract_clean_alpha(img_path: str, out_name: str, extra_bg_seeds=None, is_jpeg: bool = False):
    im = Image.open(img_path).convert("RGBA")
    arr = np.array(im, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    h, w = r.shape

    # Identify near-white studio background pixels (high luminance + low saturation)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = max_c - min_c
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    # Candidate background: bright and neutral white (tighter for JPEG compression ringing)
    if is_jpeg:
        white_cand = (lum >= 216) & (sat <= 32)
    else:
        white_cand = (lum >= 224) & (sat <= 26)

    # Flood-fill connected components from border seeds + interior arm-loop seeds
    labeled, num_features = ndimage.label(white_cand)
    bg_labels = set()

    # Border pixels
    bg_labels.update(np.unique(labeled[0, :]).tolist())
    bg_labels.update(np.unique(labeled[-1, :]).tolist())
    bg_labels.update(np.unique(labeled[:, 0]).tolist())
    bg_labels.update(np.unique(labeled[:, -1]).tolist())

    # Optional interior background holes (e.g., triangle between bent arm on hip and torso)
    if extra_bg_seeds:
        for (fx, fy) in extra_bg_seeds:
            sx, sy = int(w * fx), int(h * fy)
            patch = labeled[max(0, sy - 36):min(h, sy + 36), max(0, sx - 36):min(w, sx + 36)]
            vals = patch[patch > 0]
            if len(vals) > 0:
                u, c = np.unique(vals, return_counts=True)
                bg_labels.add(int(u[np.argmax(c)]))

    # Also auto-detect pure-white studio cutouts enclosed inside the lower torso/arm region
    # (y > 62% height, away from eyes/collar/marker)
    pure_white = (lum >= 242) & (sat <= 14)
    pw_labeled, pw_num = ndimage.label(pure_white)
    if pw_num > 0:
        lower_right = pw_labeled[int(h * 0.62):int(h * 0.92), int(w * 0.58):int(w * 0.95)]
        for lbl in np.unique(lower_right):
            if lbl == 0:
                continue
            comp_mask = pw_labeled == lbl
            if comp_mask.sum() >= 250:
                # Map back to white_cand labels so the entire soft rim of the hole is removed
                mapped = labeled[comp_mask]
                bg_labels.update(np.unique(mapped[mapped > 0]).tolist())

    bg_labels.discard(0)
    bg_mask = np.isin(labeled, list(bg_labels))

    # For Emma JPEG: remove any thin 1-2px neutral-gray die-cut sticker outline & trapped white rim around hair
    if is_jpeg:
        near_outer = ndimage.binary_dilation(bg_mask, iterations=28)
        yy, xx = np.ogrid[:h, :w]
        # Exclude the white marker barrel in Emma's left hand (far-left mid height)
        protect_marker = (xx < int(w * 0.24)) & (yy >= int(h * 0.42)) & (yy <= int(h * 0.65))
        # Neutral gray die-cut line + trapped white pockets inside the outer 28px perimeter of hair/head/shoulders
        penetrable = ((lum >= 115) & (sat <= 16) & near_outer & (~protect_marker)) | white_cand
        # Ensure we don't bridge into her bright eyes or collar (eyes/collar are far from outer 28px band)
        labeled2, _ = ndimage.label(penetrable)
        bg_labels2 = set(np.unique(labeled2[bg_mask]).tolist())
        bg_labels2.discard(0)
        bg_mask = bg_mask | np.isin(labeled2, list(bg_labels2))
        # Remove isolated tiny sticker-speckle dots left floating in bg
        bg_mask = ndimage.binary_closing(bg_mask, iterations=2)

    # Gently expand core bg_mask into residual bright halo pixels, without eating dark hair/skin
    if is_jpeg:
        halo_ring = ndimage.binary_dilation(bg_mask, iterations=4) & (~bg_mask)
        bg_mask = bg_mask | (halo_ring & (lum >= 170) & (sat <= 34))
        bg_mask = ndimage.binary_dilation(bg_mask, iterations=1)
    else:
        halo_ring = ndimage.binary_dilation(bg_mask, iterations=3) & (~bg_mask)
        bg_mask = bg_mask | (halo_ring & (lum >= 185) & (sat <= 34))
        bg_mask = ndimage.binary_dilation(bg_mask, iterations=1)

    near_bg = ndimage.binary_dilation(bg_mask, iterations=3) & (~bg_mask)

    alpha = np.ones((h, w), dtype=np.float32)
    alpha[bg_mask] = 0.0

    lum_thresh = 160.0 if is_jpeg else 175.0
    fringe_white_amount = np.clip((lum - lum_thresh) / 70.0, 0.0, 1.0) * np.clip(1.0 - sat / 46.0, 0.0, 1.0)
    fringe_alpha = np.clip(1.0 - fringe_white_amount, 0.0, 1.0)
    alpha = np.where(near_bg, np.minimum(alpha, fringe_alpha), alpha)

    # Smooth 0.7px feather on the narrow outer edge band only
    alpha_smooth = ndimage.gaussian_filter(alpha, sigma=0.75 if is_jpeg else 0.7)
    edge_band = ndimage.binary_dilation(bg_mask, iterations=4)
    alpha = np.where(edge_band, alpha_smooth, 1.0)
    alpha[alpha < 0.06] = 0.0
    alpha[alpha > 0.98] = 1.0

    # Color decontamination on semi-transparent fringe + outer 2px edge pixels
    semi = ((alpha > 0.05) & (alpha < 0.98)) | (ndimage.binary_dilation(bg_mask, iterations=2) & (alpha > 0.05))
    out_rgb = arr[:, :, :3].copy()
    safe_a = np.maximum(alpha, 0.16)
    for ch in range(3):
        decontam = (out_rgb[:, :, ch] - (1.0 - alpha) * 255.0) / safe_a
        out_rgb[:, :, ch] = np.where(semi, np.clip(decontam, 0, 255), out_rgb[:, :, ch])

    # For JPEG cutouts, slightly darken any remaining bright neutral outer fringe pixels against dark hair
    if is_jpeg:
        outer_rim = ndimage.binary_dilation(bg_mask, iterations=3) & (alpha > 0.05) & (lum >= 150) & (sat <= 38)
        for ch in range(3):
            out_rgb[:, :, ch] = np.where(outer_rim, out_rgb[:, :, ch] * 0.65, out_rgb[:, :, ch])

    # Zero out RGB in fully transparent pixels for better WebP compression
    out_rgb[alpha == 0.0] = 0.0

    rgba = np.dstack([out_rgb, alpha * 255.0]).astype(np.uint8)
    out_im = Image.fromarray(rgba, mode="RGBA")

    # Tightly trim empty transparent margins with small uniform breathing padding
    bbox = out_im.getbbox()
    if bbox:
        pad = 24
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(w, bbox[2] + pad)
        y1 = min(h, bbox[3])  # flush at bottom edge so waist sits cleanly at frame bottom
        out_im = out_im.crop((x0, y0, x1, y1))

    # Resize cleanly to max 768px height using high-quality LANCZOS resampling
    cw, ch_px = out_im.size
    target_h = 768
    target_w = int(round(cw * (target_h / ch_px)))
    out_im = out_im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Export optimized transparent WebP (< 180 KB) + PNG fallback
    webp_path = os.path.join(OUT_CLIENT, f"{out_name}.webp")
    png_path = os.path.join(OUT_CLIENT, f"{out_name}.png")
    out_im.save(webp_path, format="WEBP", quality=88, method=6, exact=False)
    out_im.save(png_path, format="PNG", optimize=True)

    # Copy to shared Assets/avatars and media-pipeline/public/assets/avatars
    for dest_dir in [OUT_ASSETS, OUT_MEDIA]:
        shutil.copy2(webp_path, os.path.join(dest_dir, f"{out_name}.webp"))
        shutil.copy2(png_path, os.path.join(dest_dir, f"{out_name}.png"))

    print(f"[OK] {out_name}: {target_w}x{target_h} | webp={os.path.getsize(webp_path):,} B | png={os.path.getsize(png_path):,} B")
    return out_im


if __name__ == "__main__":
    # Extra interior white hole seeds: white triangles enclosed by bent arms on hip
    ivan_im = extract_clean_alpha(SRC_IVAN, "teacherivan-3d", extra_bg_seeds=[(0.72, 0.74), (0.28, 0.72)], is_jpeg=False)
    emma_im = extract_clean_alpha(SRC_EMMA, "emma-3d", extra_bg_seeds=[(0.73, 0.74), (0.78, 0.76), (0.83, 0.74), (0.85, 0.75)], is_jpeg=True)

    # Generate QA preview sheet composited onto Deep Midnight #091326 and Light #FAFAFA to verify 0 white halo
    sheet_w = ivan_im.width + emma_im.width + 120
    sheet_h = 840
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (9, 19, 38, 255))
    sheet.alpha_composite(ivan_im, (40, 36))
    sheet.alpha_composite(emma_im, (80 + ivan_im.width, 36))
    qa_path = os.path.join(QA_DIR, "avatars-cutout-qa.png")
    sheet.convert("RGB").save(qa_path)
    print(f"[QA] Saved cutout verification sheet to {qa_path}")
