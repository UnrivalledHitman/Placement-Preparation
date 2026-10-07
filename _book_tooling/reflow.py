import re, sys
LIMIT = 92


def breakpoints(line):
    pts = []; in_str = None; i = 0
    while i < len(line):
        c = line[i]
        if in_str:
            if c == '\\': i += 2; continue
            if c == in_str: in_str = None
        else:
            if c in '"\'': in_str = c
            elif line.startswith('//', i): break
            elif line.startswith(' + ', i): pts.append((i, 'plus'))
            elif line.startswith(', ', i): pts.append((i + 1, 'comma'))
            elif line.startswith(' && ', i) or line.startswith(' || ', i): pts.append((i, 'plus'))
            elif line.startswith(' } catch', i): pts.append((i, 'plus'))
            elif line.startswith('{ ', i) and line[:i].rstrip().endswith('try'): pts.append((i + 1, 'comma'))
            elif c == '.' and i > 0 and line[i - 1] == ')': pts.append((i, 'dot'))
            elif line.startswith(') { ', i): pts.append((i + 3, 'comma'))
            elif line.startswith('(new ', i): pts.append((i + 1, 'dot'))
            elif line.startswith('-> {', i) or line.startswith('; } ', i):
                pts.append((i + 4 if line.startswith('-> {', i) else i + 1, 'comma'))
        i += 1
    return pts


def split_comment(line):
    in_str = None; i = 0
    while i < len(line):
        c = line[i]
        if in_str:
            if c == '\\': i += 2; continue
            if c == in_str: in_str = None
        elif c in '"\'': in_str = c
        elif line.startswith('//', i): return line[:i].rstrip(), line[i:]
        i += 1
    return line, None


def reflow_line(line):
    if len(line) <= LIMIT: return [line]
    code, comment = split_comment(line)
    if comment and code.strip():
        if len(code) + 3 + len(comment) <= LIMIT: return [code + '   ' + comment]
        indent = ' ' * (len(code) - len(code.lstrip()))
        return [indent + comment] + reflow_line(code)
    indent = len(line) - len(line.lstrip())
    cont = ' ' * (indent + 8)
    out = []; cur = line
    while len(cur) > LIMIT:
        pts = [p for p in breakpoints(cur) if p[0] <= LIMIT and p[0] > len(cur) - len(cur.lstrip()) + 10]
        if not pts: break
        pos, kind = pts[-1]
        if kind == 'plus':
            head, tail = cur[:pos], cur[pos + 1:]
        elif kind == 'dot':
            head, tail = cur[:pos], cur[pos:]
        else:
            head, tail = cur[:pos], cur[pos + 1:]
        out.append(head.rstrip())
        cur = cont + tail.lstrip()
    out.append(cur)
    return out


TRY = re.compile(r'^(\s*)try \{ (.*?) \} catch \((\w+) (\w+)\) \{ (.*?) \}$')


def expand_try(line):
    m = TRY.match(line)
    if not m or len(line) <= LIMIT: return [line]
    ind, body, typ, var, handler = m.groups()
    return [ind + 'try {', ind + '    ' + body, ind + '} catch (' + typ + ' ' + var + ') {', ind + '    ' + handler,
            ind + '}']


def process(path):
    s = open(path, encoding='utf-8').read()

    def fix(m):
        lines = []
        for l in m.group(2).split('\n'):
            for e in expand_try(l): lines += reflow_line(e)
        return m.group(1) + '\n'.join(lines) + m.group(3)
    open(path, 'w', encoding='utf-8').write(re.sub(r'(```java[^\n]*\n)(.*?)(\n```)', fix, s, flags=re.S))


if __name__ == '__main__':
    for p in sys.argv[1:]: process(p)
