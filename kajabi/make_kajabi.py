#!/usr/bin/env python3
"""Packages the quiz (index.html + styles.css + quiz.js) into ONE Kajabi custom-code block.

- CSS is scoped under #fq so it cannot leak into the rest of the Kajabi page.
- The markup and the script are base64-encoded, so the code string is plain ASCII with
  no quotes or backslashes that could break the Kajabi/JSON transport.
- Results links point at the Kajabi results pages (relative paths), not sophiebyfield.com.

Writes kajabi/quiz.line.txt (the code) and kajabi/preview.html (local check only).
"""
import base64, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)


def read(name):
    return open(os.path.join(root, name), encoding='utf-8').read()


def scope_css(css):
    """Prefix every selector with #fq. Recurses into @media, keeps @keyframes intact."""
    out = []
    i = 0
    n = len(css)

    def block_end(start):
        # start points at '{'; return index of matching '}'
        depth = 0
        for j in range(start, n):
            if css[j] == '{':
                depth += 1
            elif css[j] == '}':
                depth -= 1
                if depth == 0:
                    return j
        raise ValueError('unbalanced css')

    while i < n:
        brace = css.find('{', i)
        if brace == -1:
            break
        head = css[i:brace].strip()
        end = block_end(brace)
        body = css[brace + 1:end]
        if head.startswith('@media'):
            out.append('%s{%s}' % (head, scope_css(body)))
        elif head.startswith('@keyframes') or head.startswith('@import'):
            out.append('%s{%s}' % (head, body) if head.startswith('@keyframes') else head + ';')
        else:
            sels = []
            for s in head.split(','):
                s = s.strip()
                if s in (':root', 'html', 'body', 'html, body'):
                    sels.append('#fq')
                elif s == '*':
                    sels.append('#fq *')
                elif s:
                    sels.append('#fq ' + s)
            out.append('%s{%s}' % (', '.join(sels), body))
        i = end + 1
    return '\n'.join(out)


def min_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};,>])\s*', r'\1', css)
    return css.strip()


def min_js(js):
    js = re.sub(r'/\*.*?\*/', '', js, flags=re.S)
    lines = []
    for ln in js.split('\n'):
        s = ln.strip()
        if not s or s.startswith('//'):
            continue
        lines.append(s)
    return '\n'.join(lines)


def min_html(h):
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    # A single space keeps words from running together where a sentence wraps across lines.
    h = re.sub(r'\s*\n\s*', ' ', h)
    return h


def build_markup(html):
    main = re.search(r'<main[^>]*>.*?</main>', html, re.S).group(0)
    footer = re.search(r'<footer[^>]*>.*?</footer>', html, re.S).group(0)
    # The Kajabi page has no separate <head>, so keep only the body parts.
    return '<div id="fq">%s%s</div>' % (main, footer)


def build_script(js):
    # Results go to the Kajabi results pages. The Flodesk forms still redirect
    # on their own, set in Flodesk, so this only drives the fallback redirect.
    replacements = {
        'https://sophiebyfield.com/results-hopeful/': '/results-hopeful',
        'https://sophiebyfield.com/results-precise/': '/results-precise',
        'https://sophiebyfield.com/results-wellness/': '/results-wellness',
        'https://sophiebyfield.com/results-resister/': '/results-resister',
    }
    for old, new in replacements.items():
        if old not in js:
            sys.exit('expected result URL not found: %s' % old)
        js = js.replace(old, new)
    # The script runs after #fq is in the page, so the year hook needs no extra wiring.
    return js


def loader(markup_b64, script_b64):
    # One line, single quotes only, no backslashes or double quotes.
    return (
        "<script>(function(){"
        "function d(b){var a=Uint8Array.from(atob(b),function(c){return c.charCodeAt(0)});"
        "return new TextDecoder('utf-8').decode(a);}"
        "var box=document.createElement('div');box.id='fq-box';document.currentScript.parentNode.insertBefore(box,document.currentScript);"
        "box.innerHTML=d('%s');"
        "var s=document.createElement('script');s.textContent=d('%s');document.body.appendChild(s);"
        "})();</script>"
    ) % (markup_b64, script_b64)


def main():
    html = read('index.html')
    css = read('styles.css')
    js = build_script(read('quiz.js'))

    # Fonts load in the scoped stylesheet, since the Kajabi page has no <head> to hold the link.
    fonts = ("@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400;1,9..144,600"
             "&family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');\n")
    scoped = min_css(scope_css(css))
    scoped += '#fq{min-height:0 !important;}'
    markup = '<style>' + fonts + scoped + '</style>' + min_html(build_markup(html))
    js = min_js(js)

    markup_b64 = base64.b64encode(markup.encode('utf-8')).decode('ascii')
    script_b64 = base64.b64encode(js.encode('utf-8')).decode('ascii')
    code = loader(markup_b64, script_b64)

    bad = [c for c in code if ord(c) > 126]
    if bad or '\\' in code or '"' in code:
        sys.exit('code contains non-ascii, backslash or double quote')

    open(os.path.join(here, 'quiz.line.txt'), 'w').write(code)
    print('quiz.line.txt', len(code), 'chars')

    # Local preview: the same markup and script, loaded the way Kajabi will load them.
    preview = (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Quiz preview</title>'
        '<style>body{margin:0;background:#f5f0e6}</style></head><body>'
        + code +
        '</body></html>'
    )
    open(os.path.join(here, 'preview.html'), 'w').write(preview)
    print('preview.html written')


if __name__ == '__main__':
    main()
