# Draws the app icons and the link-preview image into assets/. Run: python scripts/make-images.py
# Needs Pillow. Fonts fall back to Pillow's default if Segoe UI isn't installed.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)


def font(size, bold=False):
    for name in (["segoeuib.ttf", "arialbd.ttf"] if bold else ["segoeui.ttf", "arial.ttf"]):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def gradient(size, stops):
    """Diagonal gradient through (position, (r, g, b)) stops."""
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x / w + y / h) / 2
            for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
                if p0 <= t <= p1:
                    k = (t - p0) / (p1 - p0 or 1)
                    px[x, y] = tuple(int(a + (b - a) * k) for a, b in zip(c0, c1))
                    break
    return img


BLUE = [(0, (100, 210, 255)), (0.52, (10, 132, 255)), (1, (94, 92, 230))]
GOLD = [(0, (251, 232, 181)), (0.48, (230, 189, 98)), (1, (185, 134, 46))]
SILVER = [(0, (244, 245, 248)), (0.48, (211, 216, 224)), (1, (158, 166, 180))]


def card(w, stops, chip=True):
    """A card face with rounded corners, a sheen and an EMV chip."""
    h = int(w / 1.586)
    face = gradient((w, h), stops).convert("RGBA")
    sheen = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sheen).ellipse((-w * 0.3, -h * 0.9, w * 0.7, h * 0.6), fill=(255, 255, 255, 60))
    face = Image.alpha_composite(face, sheen.filter(ImageFilter.GaussianBlur(w // 12)))
    if chip:
        d = ImageDraw.Draw(face)
        cw = int(w * 0.15)
        d.rounded_rectangle((int(w * 0.09), int(h * 0.36), int(w * 0.09) + cw, int(h * 0.36) + int(cw * 0.78)), radius=cw // 6, fill=(232, 205, 130))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=int(w * 0.07), fill=255)
    face.putalpha(mask)
    return face


def icon(size, maskable=False):
    bg = gradient((size, size), BLUE).convert("RGBA")
    if not maskable:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=255)
        bg.putalpha(mask)
    # A white card centered inside the 80% safe zone used by maskable icons.
    cw = int(size * (0.56 if maskable else 0.64))
    face = card(cw, [(0, (255, 255, 255)), (1, (232, 238, 250))])
    shadow = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    x, y = (size - cw) // 2, (size - face.height) // 2
    ImageDraw.Draw(shadow).rounded_rectangle((x, y + size // 40, x + cw, y + face.height + size // 40), radius=int(cw * 0.07), fill=(0, 0, 60, 70))
    bg = Image.alpha_composite(bg, shadow.filter(ImageFilter.GaussianBlur(size // 40)))
    bg.alpha_composite(face, (x, y))
    return bg


for s in (192, 512):
    icon(s).save(OUT / f"icon-{s}.png")
icon(512, maskable=True).save(OUT / "icon-maskable-512.png")
icon(180, maskable=True).convert("RGB").save(OUT / "apple-touch-icon.png")

# Link preview: 1200 x 630.
og = Image.new("RGBA", (1200, 630), (245, 245, 247, 255))
d = ImageDraw.Draw(og)
d.text((72, 160), "PH Card Finder", font=font(36, True), fill=(110, 110, 115))
d.text((72, 220), "The right card.", font=font(58, True), fill=(29, 29, 31))
d.text((72, 292), "For the way you spend.", font=font(58, True), fill=(10, 120, 240))
d.text((72, 400), "Philippine credit cards ranked for you,", font=font(28), fill=(110, 110, 115))
d.text((72, 438), "with requirements, rewards and apply links.", font=font(28), fill=(110, 110, 115))
for stops, angle, pos in ((SILVER, 14, (840, 70)), (GOLD, -10, (770, 250)), (BLUE, 4, (850, 300))):
    face = card(330, stops).rotate(angle, expand=True, resample=Image.BICUBIC)
    og.alpha_composite(face, pos)
og.convert("RGB").save(OUT / "og.png", optimize=True)
print("Wrote", ", ".join(sorted(p.name for p in OUT.iterdir())))
