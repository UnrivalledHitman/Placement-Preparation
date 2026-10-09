"""Run ```git run blocks (Windows, Git for Windows): each block runs in Git Bash in a fresh empty
directory shown as /home/learner/work, with an isolated git configuration (no system or user
config) and a fake clock that advances 60 seconds on every git command, so commit hashes,
reflogs and dates are identical on every run. stderr is merged into stdout. A block that exits
non-zero fails the build; write `|| echo "exit status $?"` where a failure is the point."""
import re, subprocess, os, shutil, hashlib, stat
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, 'gitcache')
BOX = os.path.join(ROOT, 'tmp', 'gitbox')
BASH = r'C:\Program Files\Git\bin\bash.exe'
GITCONFIG = """[user]
\tname = Asha Rao
\temail = asha@example.com
[init]
\tdefaultBranch = main
[core]
\tautocrlf = false
\tpager = cat
\tfileMode = false
[color]
\tui = never
[advice]
\tdetachedHead = false
\tskippedCherryPicks = false
[pull]
\trebase = false
"""
PRELUDE = """cd "$HOME/work"
__t=1767258000                                  # 2026-01-01 09:00 UTC
git() { __t=$((__t + 60)); GIT_AUTHOR_DATE="$__t +0000" GIT_COMMITTER_DATE="$__t +0000" command git "$@"; }
"""


def _clear(path):
    """Remove a previous box; git makes object files read-only, which rmtree cannot delete on Windows."""
    def make_writable(func, p, _exc):
        os.chmod(p, stat.S_IWRITE)
        func(p)
    if os.path.exists(path):
        shutil.rmtree(path, onexc=make_writable)


def run_code(code, tag, n):
    os.makedirs(CACHE, exist_ok=True)
    key = hashlib.sha256(('git v3\n' + GITCONFIG + PRELUDE + code).encode()).hexdigest()
    cache = os.path.join(CACHE, key + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    home = os.path.join(BOX, 'learner')
    _clear(BOX)
    os.makedirs(os.path.join(home, 'work'))
    open(os.path.join(home, '.gitconfig'), 'w', encoding='utf-8', newline='\n').write(GITCONFIG)
    script = os.path.join(BOX, f'{re.sub(r"\W", "_", tag)}_{n}.sh')
    open(script, 'w', encoding='utf-8', newline='\n').write(PRELUDE + code + '\n')
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env.update(HOME=home, GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=os.path.join(home, '.gitconfig'),
               TZ='UTC', LANG='C.UTF-8', LC_ALL='C.UTF-8', TERM='dumb', GIT_TERMINAL_PROMPT='0',
               GIT_EDITOR='true', EDITOR='true', GIT_PAGER='cat', PAGER='cat')
    r = subprocess.run([BASH, '--noprofile', '--norc', script], cwd=os.path.join(home, 'work'), env=env,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8',
                       timeout=300)
    out = r.stdout.replace('\r\n', '\n')
    fwd = home.replace('\\', '/')
    msys = '/' + fwd[0].lower() + fwd[2:]                     # C:/x -> /c/x
    for variant in (home.replace('\\', '\\\\'), home, fwd, msys):    # incl. C-escaped form
        out = out.replace(variant, '/home/learner')
    out = out.replace('/home/learner\\\\', '/home/learner/').replace('/home/learner\\', '/home/learner/')
    out = out.replace(script.replace('\\', '/'), 'script.sh').replace(script, 'script.sh')
    if r.returncode != 0:
        raise SystemExit(f'GIT BLOCK FAILED {n} ({tag}), exit {r.returncode}:\n{code[:600]}\n'
                         f'{out[-2500:]}')
    open(cache, 'w', encoding='utf-8').write(out)
    return out


def expand(src, tag='git'):
    out, lines, i, n = [], src.split('\n'), 0, 0
    while i < len(lines):
        m = re.match(r'```git run(?: (.*))?$', lines[i].strip())
        if m:
            title = m.group(1); j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            n += 1
            stdout = run_code('\n'.join(buf), tag, n)
            out.append('```bash' + (' ' + title if title else '')); out += buf; out.append('```')
            res = stdout.rstrip()
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
