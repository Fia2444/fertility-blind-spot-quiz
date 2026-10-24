#!/usr/bin/env python3
"""Builds the four quiz results pages from results/template.html.
Writes results/<type>.line.txt (single-line, ASCII-only Kajabi code) and
results/preview-<type>.html (local check only)."""
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
res = os.path.join(here, 'results')

TYPES = {
    'hopeful':  ('THT', 'The Hopeful Tracker'),
    'precise':  ('TPP', 'The Precise Planner'),
    'wellness': ('TWW', 'The Wellness Warrior'),
    'resister': ('TQR', 'The Quiet Resister'),
}

# Vimeo video id and privacy hash for each type (from the Leadpages results pages).
VIDEOS = {
    'hopeful':  ('1081281939', '0905de0ff8'),
    'precise':  ('1081284093', '8b4c69d494'),
    'wellness': ('1081286623', 'e056b4e740'),
    'resister': ('1081285409', 'eac97fbb3f'),
}

tpl = open(os.path.join(res, 'template.html'), encoding='utf-8').read()
tpl = re.sub(r'<!--.*?-->', '', tpl, flags=re.S)

for key, (code, name) in TYPES.items():
    vid, vh = VIDEOS[key]
    h = tpl.replace('{{CODE}}', code).replace('{{NAME}}', name).replace('{{VID}}', vid).replace('{{VH}}', vh)
    h = ' '.join(l.strip() for l in h.split('\n') if l.strip())
    h = h.replace('"', "'")
    h = re.sub(r'>\s+<', '><', h)
    bad = [c for c in h if ord(c) > 126]
    if bad:
        sys.exit('non-ascii in %s: %r' % (key, bad[:5]))
    if '\\' in h:
        sys.exit('backslash in %s' % key)
    open(os.path.join(res, key + '.line.txt'), 'w').write(h)
    page = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1"><title>%s preview</title>'
            '<style>body{margin:0}</style></head><body>%s</body></html>') % (name, h)
    open(os.path.join(res, 'preview-' + key + '.html'), 'w').write(page)
    print(key, len(h))
