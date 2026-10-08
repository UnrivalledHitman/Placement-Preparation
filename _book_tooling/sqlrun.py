"""Run ```sql blocks against a real MySQL 8 server with the mysql command-line client.

Block headers:
  ```sql fresh Title   drop the database, then run the block (for the block that creates it)
  ```sql run Title     drop the database, run the setup script, then run the block
  ```sql run+ Title    run the block on the current state (continues from the previous block)
  ```sql Title         displayed only

Output is what the mysql client prints in table mode, with the statement echoes, timings,
"at line N" notes and "Query OK, 0 rows affected" lines (DDL noise) removed. stderr is merged
into stdout, so error messages appear where they happen. Outputs are cached in sqlcache/.

Configuration (environment variables):
  MYSQL_CLIENT  path to mysql (default: `mysql` on PATH, else the Windows default install path)
  MYSQL_ARGS    connection arguments (default: --login-path=bookcheck; cloud example: -uroot)
  MYSQL_DB      database name (default: company)
Never put a password in MYSQL_ARGS: use mysql_config_editor login paths or ~/.my.cnf instead."""
import hashlib, os, re, shlex, shutil, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, 'sqlcache')
WIN_DEFAULT = r'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'
CLIENT = os.environ.get('MYSQL_CLIENT') or shutil.which('mysql') or WIN_DEFAULT
ARGS = shlex.split(os.environ.get('MYSQL_ARGS', '--login-path=bookcheck'))
DB = os.environ.get('MYSQL_DB', 'company')
SETUP = ''


def use(path):
    """Set the setup script run before every `sql run` block."""
    global SETUP
    SETUP = open(path, encoding='utf-8').read()


def _mysql(sql, verbose):
    cmd = [CLIENT] + ARGS + ['--default-character-set=utf8mb4', '--force', '-n']
    cmd += ['-t', '-vvv'] if verbose else ['-s']
    r = subprocess.run(cmd, input=sql.encode('utf-8'), stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return r.stdout.decode('utf-8', 'replace').replace('\r\n', '\n')


def _clean(raw):
    raw = re.sub(r'--------------\n.*?\n--------------\n\n?', '', raw, flags=re.S)
    raw = re.sub(r' \(\d+\.\d+ sec\)', '', raw)
    raw = re.sub(r' at line \d+', '', raw)
    raw = re.sub(r'^Query OK, 0 rows affected(, \d+ warnings?)?\n?', '', raw, flags=re.M)
    raw = re.sub(r'^Database changed\n?', '', raw, flags=re.M)
    raw = re.sub(r'\n?Bye\s*$', '', raw)
    return re.sub(r'\n{3,}', '\n\n', raw).strip()


_chain = []          # blocks since the last reset: [(mode, sql)], for replaying `run+` state


def _reset(mode):
    reset = f'DROP DATABASE IF EXISTS {DB};\n' + (SETUP if mode == 'run' else '')
    bad = [l for l in _mysql(reset, verbose=False).splitlines() if l.startswith('ERROR')]
    if bad:
        raise SystemExit('SQL SETUP FAILED:\n' + '\n'.join(bad))


def run_block(mode, sql):
    global _chain
    os.makedirs(CACHE, exist_ok=True)
    _chain = [(mode, sql)] if mode in ('fresh', 'run') else _chain + [(mode, sql)]
    if not _chain or _chain[0][0] == 'run+':
        raise SystemExit('a `sql run+` block needs a `sql run` or `sql fresh` block before it')
    key = hashlib.sha256('\x00'.join([DB, SETUP if _chain[0][0] == 'run' else '']
                                     + [m + '\x01' + s for m, s in _chain]).encode())
    cache = os.path.join(CACHE, key.hexdigest() + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    _reset(_chain[0][0])                        # rebuild the state this block expects
    for m, s in _chain[:-1]:
        _mysql((f'USE {DB};\n' if m != 'fresh' else '') + s, verbose=False)
    out = _clean(_mysql((f'USE {DB};\n' if mode != 'fresh' else '') + sql, verbose=True))
    open(cache, 'w', encoding='utf-8').write(out)
    return out


def expand(src):
    """Replace runnable sql blocks with the block followed by an Output box."""
    out, lines, i = [], src.split('\n'), 0
    while i < len(lines):
        m = re.match(r'```sql (fresh|run\+?)(?: (.*))?$', lines[i].strip())
        if m:
            mode, title = m.group(1), m.group(2)
            j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            res = run_block(mode, '\n'.join(buf))
            out.append('```sql' + (' ' + title if title else '')); out += buf; out.append('```')
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
