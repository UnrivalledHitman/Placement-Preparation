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


LIB = os.path.join(ROOT, 'lib')
JUNIT_JARS = ['junit-platform-console-standalone-1.14.4.jar', 'mockito-core-5.24.0.jar', 'byte-buddy-1.18.14.jar',
              'byte-buddy-agent-1.18.14.jar', 'objenesis-3.6.jar', 'mockito-junit-jupiter-5.24.0.jar']


def run_junit(code, n):
    """```java junit``` blocks: compile against JUnit 5 + Mockito and run the console launcher.
    Failing tests are allowed (and shown); compilation errors abort the build."""
    os.makedirs(CACHE, exist_ok=True)
    cache = os.path.join(CACHE, hashlib.sha256(('junit v7\n' + code).encode()).hexdigest() + '.out')
    if os.path.exists(cache):
        return open(cache, encoding='utf-8').read()
    d = os.path.join(ROOT, 'tmp', 'jr', f'junit{n}')
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    parts = re.split(r'^// file: (\w+\.java)[ \t]*$', code, flags=re.M)
    if len(parts) > 1:      # '// file: X.java' lines split the block into separate source files
        files = dict(zip(parts[1::2], parts[2::2]))
    else:
        m = re.search(r'public\s+(?:final\s+)?class\s+(\w+)', code)
        files = {(m.group(1) if m else 'Tests') + '.java': code}
    for name, body in files.items():
        open(os.path.join(d, name), 'w', encoding='utf-8').write(body)
    jars = [os.path.join(LIB, j) for j in JUNIT_JARS]
    cp = os.pathsep.join(jars)
    c = subprocess.run(['javac', '-encoding', 'UTF-8', '-parameters', '-cp', cp, '-d', 'classes'] + list(files),
                       cwd=d, capture_output=True, text=True, encoding='utf-8')
    if c.returncode != 0:
        raise SystemExit(f'JAVAC FAILED junit block {n}:\n{code[:600]}\n{c.stderr[:2500]}')
    cmd = ['java', '-Dstdout.encoding=UTF-8', '-Dfile.encoding=UTF-8', '-Xshare:off',
           f'-javaagent:{jars[1]}', '-cp', os.pathsep.join(['classes'] + jars),
           'org.junit.platform.console.ConsoleLauncher', 'execute', '--scan-class-path', 'classes',
           '--include-classname', '.*', '--details=tree', '--disable-banner', '--disable-ansi-colors']
    r = subprocess.run(cmd, cwd=d, capture_output=True, text=True, encoding='utf-8', timeout=300)
    text = r.stdout.replace('\r\n', '\n')
    keep, extra = [], 0
    for line in text.split('\n'):                        # the test tree only, no stack traces
        if not line.startswith(('├', '└', '│')) or re.search(r'JUnit (Vintage|Platform Suite)', line):
            continue
        if '├─' in line or '└─' in line:
            extra = 0
        else:                                            # a failure message's continuation line
            if not line.strip(' │'):
                continue
            extra += 1
            if extra > 7:
                continue
        keep.append(re.sub(r'\s+\d+ ms\b', '', line.replace('\t', ' ').replace('org.opentest4j.AssertionFailedError: ', '')).rstrip())
    keep = [l if len(l) <= 94 else l[:90].rstrip() + ' ...' for l in keep]   # fit the page width
    count = lambda what: int(re.search(r'(\d+) tests ' + what, text).group(1))
    keep.append(f'{count("successful")} tests successful, {count("failed")} failed')
    out = '\n'.join(keep) + '\n'
    open(cache, 'w', encoding='utf-8').write(out)
    return out


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
        m = re.match(r'```java (run|junit|spring-security|spring|jdbc)(?: (.*))?$', s)
        if m:
            spring, title = (None if m.group(1) == 'run' else m.group(1)), m.group(2)
            j = i + 1; buf = []
            while not lines[j].strip().startswith('```'):
                buf.append(lines[j]); j += 1
            n += 1
            res = (run_junit('\n'.join(buf), n) if spring == 'junit'
                   else run_code('\n'.join(buf), n, spring)).rstrip()
            out.append('```java' + (' ' + title if title else '')); out += buf; out.append('```')
            if res:
                out.append('```out Output'); out += res.split('\n'); out.append('```')
            i = j + 1; continue
        out.append(lines[i]); i += 1
    return '\n'.join(out)
