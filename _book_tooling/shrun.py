"""Run ```bash run blocks: each block runs in a fresh empty directory as the unprivileged user
nobody (uid 65534), with a fixed environment so outputs are reproducible. stderr is merged into
stdout so error messages appear in the output. A block that exits non-zero fails the build;
write `|| echo "exit status $?"` where a failure is the point of the demo."""
import re, subprocess, os, shutil, hashlib
ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, 'shcache')
BOX = os.path.join('/var/tmp', 'shbox')
FIX = os.path.join(ROOT, 'sh_fixtures')      # copied into every fresh home directory
UID = 65534
PRELUDE = 'umask 022\ncd "$HOME"\n'
ENV = {'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', 'LANG': 'C.UTF-8',
       'LC_ALL': 'C.UTF-8', 'TZ': 'UTC', 'TERM': 'dumb', 'USER': 'nobody', 'LOGNAME': 'nobody',
       'SHELL': '/bin/bash', 'PS4': '+ '}


def run_code(code, tag, n):
    os.makedirs(CACHE, exist_ok=True)
    fx = ''
    if os.path.isdir(FIX):
        for name in sorted(os.listdir(FIX)):
            fx += name + open(os.path.join(FIX, name), encoding='utf-8').read()
    key = hashlib.sha256((fx + PRELUDE + code).encode()).hexdigest()
    cache = os.path.join(CACHE, key + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    home = os.path.join(BOX, 'learner')
    shutil.rmtree(BOX, ignore_errors=True)
    os.makedirs(home)
    os.chmod(BOX, 0o755)
    if os.path.isdir(FIX):
        for name in os.listdir(FIX):
            dst = os.path.join(home, name)
            shutil.copy(os.path.join(FIX, name), dst)
            os.chown(dst, UID, UID)
    os.chown(home, UID, UID)
    script = os.path.join(BOX, f'{re.sub(r"\W", "_", tag)}_{n}.sh')
    open(script, 'w', encoding='utf-8').write(PRELUDE + code + '\n')
    os.chmod(script, 0o644)
    env = dict(ENV, HOME=home)
    cmd = ['setpriv', f'--reuid={UID}', f'--regid={UID}', '--clear-groups', 'bash', script]
    r = subprocess.run(cmd, cwd=home, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       text=True, encoding='utf-8', timeout=300)
    out = r.stdout.replace(home, '/home/learner').replace(script, 'script.sh')
    if r.returncode != 0:
        raise SystemExit(f'SH FAILED block {n} ({tag}), exit {r.returncode}:\n{code[:600]}\n'
                         f'{out[-2500:]}')
    open(cache, 'w', encoding='utf-8').write(out)
    return out


def expand(src, tag='bash'):
    out, lines, i, n = [], src.split('\n'), 0, 0
    while i < len(lines):
        m = re.match(r'```bash run(?: (.*))?$', lines[i].strip())
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
