import os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE) + '/'
W, H = 1200, 630
BOX_W, BOX_H = 450, 540
CX = 588
TITLE_X = 845
FONT_CANDIDATES = [
    os.environ.get('OG_FONT', ''),
    '/usr/share/fonts/opentype/inter/Inter-Bold.otf',
    '/usr/share/fonts/truetype/inter/Inter-Bold.ttf',
    'Inter-Bold.otf',
    'Inter-Bold.ttf',
]
FONT = next((p for p in FONT_CANDIDATES if p and os.path.exists(p)), None)
if not FONT:
    sys.exit('Inter Bold font not found. Set OG_FONT=/path/to/Inter-Bold.otf')


def background():
    a = np.full((H, W), 12.0)
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - 640) / 700.0) ** 2 + ((yy - 315) / 420.0) ** 2)
    a += np.clip(1 - d, 0, 1) ** 2 * 9
    a[:, ::60] = np.maximum(a[:, ::60], 18 + np.clip(1 - d[:, ::60], 0, 1) * 4)
    a[::60, :] = np.maximum(a[::60, :], 18 + np.clip(1 - d[::60, :], 0, 1) * 4)
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8')).convert('RGBA')


def wrap(draw, text, font, maxw):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_title(draw, text, maxw=340, maxh=420):
    for size in range(56, 28, -2):
        f = ImageFont.truetype(FONT, size)
        lines = wrap(draw, text, f, maxw)
        if all(draw.textlength(l, font=f) <= maxw for l in lines) and len(lines) * size * 1.18 <= maxh and len(lines) <= 4:
            break
    return f, lines, size


def load_forms():
    reg = open(ROOT + 'forms/registry.js', encoding='utf-8').read()
    return re.findall(r"slug:\s*'([^']+)'.*?title:\s*\{\s*bn:\s*'[^']*',\s*en:\s*'([^']*)'", reg, re.S)


def build(slug, title, brand, out_dir):
    img = background()
    img.alpha_composite(brand, (60, 80))
    pv = Image.open(ROOT + 'assets/previews/%s.webp' % slug).convert('RGBA')
    bb = pv.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb:
        pv = pv.crop(bb)
    s = min(BOX_W / pv.width, BOX_H / pv.height)
    pv = pv.resize((round(pv.width * s), round(pv.height * s)), Image.LANCZOS)
    x, y = CX - pv.width // 2, (H - pv.height) // 2
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    black = Image.new('RGBA', pv.size, (0, 0, 0, 255))
    black.putalpha(pv.split()[3].point(lambda v: int(v * 0.75)))
    shadow.alpha_composite(black, (x, y + 14))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))
    img.alpha_composite(pv, (x, y))
    d = ImageDraw.Draw(img)
    f, lines, size = fit_title(d, title)
    lh = int(size * 1.18)
    ty = (H - lh * len(lines)) // 2 - 4
    for i, l in enumerate(lines):
        d.text((TITLE_X, ty + i * lh), l, font=f, fill=(255, 255, 255, 255))
    img.convert('RGB').save(os.path.join(out_dir, slug + '.png'), optimize=True)


def main():
    args = sys.argv[1:]
    out_dir = os.path.join(HERE, 'og-output')
    if '--out' in args:
        i = args.index('--out')
        out_dir = args[i + 1]
        del args[i:i + 2]
    os.makedirs(out_dir, exist_ok=True)
    brand = Image.open(os.path.join(HERE, 'og-brand.png')).convert('RGBA')
    forms = load_forms()
    if args:
        forms = [f for f in forms if f[0] in args]
    for slug, title in forms:
        build(slug, title, brand, out_dir)
        print('done', slug)


main()
