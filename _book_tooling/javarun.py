import re, subprocess, os, shutil, hashlib
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, 'jcache')
JAVA = ['java', '-Dstdout.encoding=UTF-8', '-Dfile.encoding=UTF-8', 'Main.java']


def main_first(code):
    i = code.find('public class Main')
    if i <= 0:
        return code
    j = code.index('{', i); depth = 0
    for k in range(j, len(code)):
        if code[k] == '{': depth += 1
        elif code[k] == '}':
            depth -= 1
            if depth == 0: break
    main = code[i:k + 1]
    rest = code[:i] + code[k + 1:]
    lines = rest.split('\n')
    last = max([n for n, l in enumerate(lines) if l.startswith('import ')], default=-1)
    return '\n'.join(lines[:last + 1] + [main] + lines[last + 1:])


def run_code(code, n):
    os.makedirs(CACHE, exist_ok=True)
    src = main_first(code)
    cache = os.path.join(CACHE, hashlib.sha256(src.encode()).hexdigest() + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    d = os.path.join(ROOT, 'tmp', 'jr', str(n))
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    open(os.path.join(d, 'Main.java'), 'w', encoding='utf-8').write(src)
    r = subprocess.run(JAVA, cwd=d, capture_output=True, text=True, encoding='utf-8', timeout=120)
    if r.returncode != 0:
        raise SystemExit(f'JAVA FAILED block {n}:\n{code[:600]}\n{r.stderr[:2500]}')
    out = r.stdout.replace('\r\n', '\n')
    open(cache, 'w', encoding='utf-8').write(out)
    return out


def expand(src):
    out, lines, i, n = [], src.split('\n'), 0, 0
    while i < len(lines):
        s = lines[i].strip()
        m = re.match(r'```java run(?: (.*))?$', s)
        if m:
            title = m.group(1)
            j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            n += 1
            res = run_code('\n'.join(buf), n).rstrip()
            out.append('```java' + (' ' + title if title else '')); out += buf; out.append('```')
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
