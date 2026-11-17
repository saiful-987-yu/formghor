#!/usr/bin/env python3
"""
Makes the card preview images used on the Home and All Forms pages.

For every form in forms/registry.js it opens the real form page, fills it with
Demo 2 (the same as the Auto-fill > Demo 2 button), takes a picture of page 1
and writes:
  assets/previews/<slug>.webp   the picture (cards: transparent background)
  forms/previews.js             size, mode and main colour of every picture

Run from the project root (needs: pip install playwright pillow, then
playwright install chromium, and internet for web fonts):
  python3 tools/make-previews.py              all forms
  python3 tools/make-previews.py --only resume,cv-sidebar

Put the Demo 2 photos in assets/ first (see README), otherwise the photo
frames stay empty.
"""
import argparse
import functools
import http.server
import io
import json
import os
import re
import socketserver
import colorsys
import threading

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'assets', 'previews')
META_FILE = os.path.join(ROOT, 'forms', 'previews.js')
DOC_WIDTH = 560
CARD_MAX = 640
CARD_LIMIT = 0.55

HIDE_CSS = (
    '*{transition:none!important;animation:none!important}'
    '.g-header,.g-footer,.g-toast,.g-modal,.g-photo-hint{display:none!important}'
    '.g-page,.g-page-inner,.g-pages-wrap,.g-stage,.g-pages,body,html{'
    'outline:none!important;border:none!important;box-shadow:none!important}'
)
CLEAR_CSS = '.g-page,.g-page-inner,.g-pages-wrap,.g-stage,.g-pages,body,html{background:transparent!important}'
WHITE_CSS = '.g-page{background:#fff!important}'


def slugs_from_registry():
    text = open(os.path.join(ROOT, 'forms', 'registry.js'), encoding='utf-8').read()
    return re.findall(r"slug: '([a-z0-9-]+)'", text)


def read_meta():
    try:
        text = open(META_FILE, encoding='utf-8').read()
        return json.loads(re.search(r'window\.G_PREVIEWS = (\{.*\});', text, re.S).group(1))
    except Exception:
        return {}


def write_meta(meta, order):
    keys = [s for s in order if s in meta] + [s for s in meta if s not in order]
    lines = ['window.G_PREVIEWS = {']
    for i, key in enumerate(keys):
        lines.append(json.dumps(key) + ': ' + json.dumps(meta[key], separators=(',', ':')) + (',' if i < len(keys) - 1 else ''))
    lines.append('};')
    open(META_FILE, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')


def main_colour(img):
    small = img.copy()
    small.thumbnail((90, 90))
    raw = small.tobytes()
    buckets = {}
    for i in range(0, len(raw), 4):
        r, g, b, a = raw[i], raw[i + 1], raw[i + 2], raw[i + 3]
        if a < 200 or max(r, g, b) - min(r, g, b) < 28 or max(r, g, b) < 40:
            continue
        hue, sat, val = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if (hue < 0.12 or hue > 0.97) and 0.1 < sat < 0.7:
            continue
        entry = buckets.setdefault((r // 24, g // 24, b // 24), [0, 0, 0, 0])
        entry[0] += 1
        entry[1] += r
        entry[2] += g
        entry[3] += b
    if not buckets:
        return '#6b7280'
    best = max(buckets.values(), key=lambda e: e[0])
    n = best[0]
    return '#%02x%02x%02x' % (best[1] // n, best[2] // n, best[3] // n)


def alpha_box(img):
    return img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()


def restack(img):
    cols = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).resize((img.width, 1), Image.BOX).tobytes()
    best = None
    start = None
    for x in range(img.width + 1):
        empty = x < img.width and cols[x] == 0
        if empty and start is None:
            start = x
        if not empty and start is not None:
            if start > 0 and x < img.width and (best is None or x - start > best[1] - best[0]):
                best = (start, x)
            start = None
    if not best or best[1] - best[0] < 6:
        return img
    left = img.crop((0, 0, (best[0] + best[1]) // 2, img.height))
    right = img.crop(((best[0] + best[1]) // 2, 0, img.width, img.height))
    lb, rb = alpha_box(left), alpha_box(right)
    if not lb or not rb:
        return img
    left, right = left.crop(lb), right.crop(rb)
    gap = 16
    out = Image.new('RGBA', (max(left.width, right.width), left.height + right.height + gap), (0, 0, 0, 0))
    out.paste(left, ((out.width - left.width) // 2, 0))
    out.paste(right, ((out.width - right.width) // 2, left.height + gap))
    return out


def shoot(page, slug, demo):
    page.goto('http://127.0.0.1:%d/forms/%s/index.html' % (PORT, slug), wait_until='load')
    page.wait_for_timeout(900)
    page.evaluate("window.G && G.lock && (G.lock.verify = function () { return true; })")
    if page.locator('#g-lock:not([hidden])').count():
        page.fill('#g-lock-input', 'x')
        page.press('#g-lock-input', 'Enter')
        page.wait_for_timeout(500)
    page.click('#g-fill-btn')
    page.wait_for_timeout(300)
    page.get_by_role('button', name=re.compile(r'(ডেমো|Demo)\s*(%d|%s)' % (demo, '০১২৩৪৫৬৭৮৯'[demo] if demo < 10 else demo))).click()
    page.wait_for_timeout(1200)
    page.evaluate("document.fonts && document.fonts.ready")
    page.wait_for_function("[...document.images].every(function (i) { return i.complete; })", timeout=15000)
    page.evaluate("window.scrollTo(0, 0)")
    page.add_style_tag(content=HIDE_CSS)
    clear = page.add_style_tag(content=CLEAR_CSS)
    page.wait_for_timeout(300)
    el = page.locator('#g-pages .g-page').first
    png = el.screenshot(omit_background=True)
    full = Image.open(io.BytesIO(png)).convert('RGBA')
    box = alpha_box(full)
    if box and (box[2] - box[0]) * (box[3] - box[1]) < CARD_LIMIT * full.width * full.height:
        pad = 8
        box = (max(0, box[0] - pad), max(0, box[1] - pad), min(full.width, box[2] + pad), min(full.height, box[3] + pad))
        img = full.crop(box)
        if img.width / img.height > 2:
            img = restack(img)
        ratio = min(1, CARD_MAX / max(img.size))
        return 'card', img.resize((max(1, round(img.width * ratio)), max(1, round(img.height * ratio))), Image.LANCZOS)
    clear.evaluate('e => e.remove()')
    page.add_style_tag(content=WHITE_CSS)
    page.wait_for_timeout(300)
    img = Image.open(io.BytesIO(el.screenshot())).convert('RGBA')
    ratio = DOC_WIDTH / img.width
    return 'doc', img.resize((DOC_WIDTH, max(1, round(img.height * ratio))), Image.LANCZOS)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def start_server():
    handler = functools.partial(Quiet, directory=ROOT)
    server = socketserver.TCPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--demo', type=int, default=2)
    args = ap.parse_args()
    order = slugs_from_registry()
    todo = [s for s in args.only.split(',') if s] or order
    os.makedirs(OUT_DIR, exist_ok=True)
    server = start_server()
    PORT = server.server_address[1]
    meta = read_meta()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={'width': 1000, 'height': 1400}, device_scale_factor=2)
        for slug in todo:
            page = ctx.new_page()
            try:
                mode, img = shoot(page, slug, args.demo)
                img.save(os.path.join(OUT_DIR, slug + '.webp'), 'WEBP', quality=82, method=6)
                size = os.path.getsize(os.path.join(OUT_DIR, slug + '.webp')) // 1024
                meta[slug] = {'w': img.width, 'h': img.height, 'c': main_colour(img), 'm': mode}
                print('%-26s %-4s %4dx%-4d %3d KB %s' % (slug, mode, img.width, img.height, size, meta[slug]['c']))
            except Exception as e:
                print('FAILED', slug, str(e).split('\n')[0])
            page.close()
        browser.close()
    write_meta(meta, order)
    server.shutdown()
