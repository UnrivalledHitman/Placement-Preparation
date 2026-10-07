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


SPRING_FLAGS = ['-Dspring.main.banner-mode=off', '-Dlogging.level.root=OFF',
                '-Dspring.main.log-startup-info=false', '-Dspring.jpa.open-in-view=false']


def spring_classpath(kind):
    """Classpath of <kind>/pom.xml (kind = spring, spring-security or jdbc), resolved once with Maven
    and cached in <kind>/classpath.txt."""
    f = os.path.join(ROOT, kind, 'classpath.txt')
    if not os.path.exists(f):
        subprocess.run(['mvn', '-q', '-B', 'dependency:build-classpath',
                        '-Dmdep.outputFile=classpath.txt'], cwd=os.path.join(ROOT, kind),
                       check=True)
    return open(f, encoding='utf-8').read().strip()


def run_code(code, n, spring=False):
    os.makedirs(CACHE, exist_ok=True)
    src = code if spring else main_first(code)
    key = (spring + ' v2\n' if spring else '') + src     # bump v2 when the spring runner changes
    cache = os.path.join(CACHE, hashlib.sha256(key.encode()).hexdigest() + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    d = os.path.join(ROOT, 'tmp', 'jr', str(n))
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    open(os.path.join(d, 'Main.java'), 'w', encoding='utf-8').write(src)
    if spring:   # package demo (spring, spring-security, jdbc kinds); compiled to a directory so
                 # that component and entity scanning work
        cp = spring_classpath(spring)
        c = subprocess.run(['javac', '-parameters', '-encoding', 'UTF-8', '-cp', cp, '-d', 'classes',
                            'Main.java'], cwd=d, capture_output=True, text=True, encoding='utf-8')
        if c.returncode != 0:
            raise SystemExit(f'JAVAC FAILED block {n}:\n{code[:600]}\n{c.stderr[:2500]}')
        quiet = os.path.join(ROOT, 'spring', 'quiet-logging')   # logback-test.xml: root OFF
        cmd = ['java', '-Dstdout.encoding=UTF-8', '-Dfile.encoding=UTF-8'] + SPRING_FLAGS + \
              ['-cp', quiet + os.pathsep + cp + os.pathsep + 'classes', 'demo.Main']
    else:
        cmd = JAVA
    r = subprocess.run(cmd, cwd=d, capture_output=True, text=True, encoding='utf-8', timeout=180)
    if r.returncode != 0:
        raise SystemExit(f'JAVA FAILED block {n}:\n{code[:600]}\n{r.stderr[:2500]}')
    out = r.stdout.replace('\r\n', '\n')
    open(cache, 'w', encoding='utf-8').write(out)
    return out


def expand(src):
    out, lines, i, n = [], src.split('\n'), 0, 0
    while i < len(lines):
        s = lines[i].strip()
        m = re.match(r'```java (run|spring-security|spring|jdbc)(?: (.*))?$', s)
        if m:
            spring, title = (None if m.group(1) == 'run' else m.group(1)), m.group(2)
            j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            n += 1
            res = run_code('\n'.join(buf), n, spring).rstrip()
            out.append('```java' + (' ' + title if title else '')); out += buf; out.append('```')
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
