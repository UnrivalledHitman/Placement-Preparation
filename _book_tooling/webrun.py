"""Run front-end blocks.
```js run Title      -> node (ES module); stdout + stderr shown
```ts run Title      -> tsc --strict; compile errors are shown as output, otherwise node runs it
```html run Title    -> rendered in headless Chromium; console.log output shown.
   A first line <!-- shot: name.png 720x360 --> saves a screenshot to figs/ and inserts it.
   Pages can load ./lib/react.js, ./lib/react-dom.js, ./lib/babel.js, ./lib/axe.js.
A non-zero exit fails the build."""
import re, subprocess, os, shutil, hashlib
ROOT = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(ROOT, 'web')
FIGS = os.path.join(ROOT, 'figs')
CACHE = os.path.join(ROOT, 'webcache')
BOX = os.path.join(ROOT, 'tmp', 'webbox')
NM = os.path.join(WEB, 'node_modules')
LIBS = {'react.js': 'react/umd/react.development.js',
        'react-dom.js': 'react-dom/umd/react-dom.development.js',
        'babel.js': '@babel/standalone/babel.min.js', 'axe.js': 'axe-core/axe.min.js'}
VERSION = 'web ' + hashlib.sha256(open(os.path.join(WEB, 'render.mjs'), 'rb').read()
                         + open(__file__, 'rb').read()).hexdigest() + '\n'
TSC = '/opt/node22/lib/node_modules/typescript/bin/tsc'


def fresh_box():
    shutil.rmtree(BOX, ignore_errors=True)
    os.makedirs(os.path.join(BOX, 'lib'))
    for name, rel in LIBS.items():
        os.symlink(os.path.join(NM, rel), os.path.join(BOX, 'lib', name))


def run(cmd, timeout=120):
    r = subprocess.run(cmd, cwd=BOX, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                       encoding='utf-8', timeout=timeout,
                       env=dict(os.environ, TZ='UTC', LANG='C.UTF-8', NO_COLOR='1'))
    return r.returncode, r.stdout.replace(BOX + '/', '').replace(BOX, '.')


def run_block(kind, code, shot):
    os.makedirs(CACHE, exist_ok=True)
    key = hashlib.sha256((VERSION + kind + '\n' + ' '.join(shot or ()) + '\n' + code).encode()).hexdigest()
    cache = os.path.join(CACHE, key + '.out')
    if os.path.exists(cache) and (not shot or os.path.exists(os.path.join(FIGS, shot[0]))):
        return open(cache, encoding='utf-8').read()
    fresh_box()
    if kind == 'js' and code.startswith('// node --test'):
        open(os.path.join(BOX, 'main.test.mjs'), 'w', encoding='utf-8').write(code + '\n')
        rc, out = run(['node', '--test', '--test-reporter=spec', 'main.test.mjs'])
        out = re.sub(r' \([0-9.]+m?s\)', '', out)
        out = '\n'.join(l for l in out.split('\n') if 'duration_ms' not in l)
        out = out.split('\n✖ failing tests:')[0].rstrip() + '\n'    # details of todo tests
    elif kind == 'js':
        open(os.path.join(BOX, 'main.mjs'), 'w', encoding='utf-8').write(code + '\n')
        rc, out = run(['node', 'main.mjs'])
    elif kind == 'ts':
        open(os.path.join(BOX, 'main.ts'), 'w', encoding='utf-8').write(code + '\n')
        open(os.path.join(BOX, 'package.json'), 'w').write('{"type": "module"}\n')
        rc, out = run(['node', TSC, '--strict', '--target', 'es2022', '--module', 'nodenext',
                       '--moduleResolution', 'nodenext', '--outDir', 'out',
                       '--pretty', 'false', 'main.ts'])
        if rc == 0:
            rc, out = run(['node', 'out/main.js'])
        else:
            out, rc = 'tsc: ' + out.strip().replace('\n', '\ntsc: ') + '\n', 0
    else:
        page = code if re.search(r'<html', code, re.I) else (
            '<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:'
            '"DejaVu Sans",sans-serif;margin:16px}</style></head><body>\n' + code +
            '\n</body></html>')
        open(os.path.join(BOX, 'page.html'), 'w', encoding='utf-8').write(page)
        os.makedirs(FIGS, exist_ok=True)
        target = os.path.join(FIGS, shot[0]) if shot else '-'
        rc, out = run(['node', os.path.join(WEB, 'render.mjs'), os.path.join(BOX, 'page.html'),
                       target, shot[1] if shot else '720x360'])
    if rc != 0:
        raise SystemExit(f'WEB FAILED ({kind}), exit {rc}:\n{code[:600]}\n{out[-2500:]}')
    open(cache, 'w', encoding='utf-8').write(out)
    return out


def expand(src, tag='web'):
    out, lines, i = [], src.split('\n'), 0
    while i < len(lines):
        m = re.match(r'```(js|ts|html) run(?: (.*))?$', lines[i].strip())
        if m:
            kind, title = m.group(1), m.group(2); j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            shot = None
            if buf and (sm := re.match(r'\s*<!-- shot: (\S+\.png) (\d+x\d+) -->\s*$', buf[0])):
                shot = (sm.group(1), sm.group(2)); buf = buf[1:]
            stdout = run_block(kind, '\n'.join(buf), shot)
            lang = {'js': 'javascript', 'ts': 'typescript', 'html': 'html'}[kind]
            out.append(f'```{lang}' + (' ' + title if title else '')); out += buf; out.append('```')
            res = stdout.rstrip()
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            if shot:
                out.append(''); out.append(f'![{title or "Rendered page"}](figs/{shot[0]})')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
