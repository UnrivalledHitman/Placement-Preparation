import re, subprocess, os, sys, hashlib, ast
ROOT = os.path.dirname(os.path.abspath(__file__))
FIGS = os.path.join(ROOT, 'figs')
CACHE = os.path.join(ROOT, 'pycache')
TMP = os.path.join(ROOT, 'tmp')
ENV = dict(os.environ, PYTHONPATH=FIGS + os.pathsep + os.path.join(ROOT, 'pylib'), MPLBACKEND='Agg', PYTHONHASHSEED='0', PYTHONIOENCODING='utf-8', PYTHONUTF8='1')
PRELUDE = """import warnings; warnings.filterwarnings('ignore')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams.update({'figure.figsize': (6.4, 3.2), 'figure.dpi': 150, 'axes.grid': True, 'grid.alpha': 0.3,
                     'axes.spines.top': False, 'axes.spines.right': False, 'font.size': 9})
"""


def cache_key(code):
    try:
        return 'ast_' + hashlib.sha256(ast.dump(ast.parse(code)).encode()).hexdigest()
    except SyntaxError:
        return 'raw_' + hashlib.sha256((PRELUDE + code).encode()).hexdigest()


def run_code(code, tag, n):
    os.makedirs(FIGS, exist_ok=True); os.makedirs(CACHE, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    cache = os.path.join(CACHE, cache_key(code) + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    path = os.path.join(TMP, 'py_' + re.sub(r'\W', '_', tag) + f'_{n}.py')
    open(path, 'w', encoding='utf-8').write(PRELUDE + code + '\n')
    r = subprocess.run([sys.executable, path], cwd=FIGS, env=ENV, capture_output=True, text=True,
                       encoding='utf-8', timeout=900)
    if r.returncode != 0:
        raise SystemExit(f'PY FAILED block {n} ({tag}):\n{code[:600]}\n{r.stderr[-2500:]}')
    open(cache, 'w', encoding='utf-8').write(r.stdout)
    return r.stdout


def expand(src, tag='python'):
    out, lines, i, n = [], src.split('\n'), 0, 0
    while i < len(lines):
        m = re.match(r'```python run(?: (.*))?$', lines[i].strip())
        if m:
            title = m.group(1); j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            n += 1
            stdout = run_code('\n'.join(buf), tag, n)
            out.append('```python' + (' ' + title if title else '')); out += buf; out.append('```')
            res = stdout.rstrip()
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
