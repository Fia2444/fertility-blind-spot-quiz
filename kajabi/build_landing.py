#!/usr/bin/env python3
"""Turns kajabi/landing/top.html and bottom.html into single-line, ASCII-only code blocks
(landing/top.line.txt, landing/bottom.line.txt) for the Kajabi /quiz draft.
The quiz itself stays in its own section (quiz.line.txt, built by make_kajabi.py).
Also writes landing-preview.html: top + quiz + bottom in order, for a local check only."""
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
land = os.path.join(here, 'landing')


def build(name):
    h = open(os.path.join(land, name + '.html'), encoding='utf-8').read()
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    h = ' '.join(l.strip() for l in h.split('\n') if l.strip())
    h = h.replace('"', "'")
    h = re.sub(r'>\s+<', '><', h)
    bad = [c for c in h if ord(c) > 126]
    if bad:
        sys.exit('non-ascii in %s: %r' % (name, bad[:5]))
    if '\\' in h:
        sys.exit('backslash in %s' % name)
    open(os.path.join(land, name + '.line.txt'), 'w').write(h)
    print(name, len(h))
    return h


top = build('top')
bottom = build('bottom')
quiz = open(os.path.join(here, 'quiz.line.txt')).read()
page = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Quiz landing preview</title>'
        '<style>body{margin:0}</style></head><body>' + top + quiz + bottom + '</body></html>')
open(os.path.join(here, 'landing-preview.html'), 'w').write(page)
print('landing-preview.html written')
