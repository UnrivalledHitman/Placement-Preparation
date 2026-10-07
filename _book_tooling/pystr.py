import re, sys
from pyreflow import scan, LIMIT

COMPOUND = ("if ", "elif ", "else:", "for ", "while ", "with ", "def ", "class ", "try:", "except", "finally:")


def split_statements(line):
    """Split 'a; b' at depth 0 outside strings into two lines with the same indent."""
    indent = line[:len(line) - len(line.lstrip())]
    if line.lstrip().startswith(COMPOUND):
        return [line]
    depth, s, i = 0, None, 0
    while i < len(line):
        c = line[i]
        if s:
            if c == '\\': i += 2; continue
            if c == s: s = None
        elif c in '"\'': s = c
        elif c == '#': break
        elif c in '([{': depth += 1
        elif c in ')]}': depth -= 1
        elif depth == 0 and line.startswith('; ', i):
            return [line[:i]] + split_statements(indent + line[i + 2:])
        i += 1
    return [line]


def split_string(line, depth_before):
    """Split the longest string literal (inside brackets) into two adjacent literals."""
    for m in re.finditer(r'([fb]?)(["\'])((?:\\.|(?!\2).)*)\2', line):
        prefix, q, body = m.group(1), m.group(2), m.group(3)
        _, d, _, _ = scan(line[:m.start()], depth_before, None)
        if d <= 0 or m.end() <= LIMIT: continue
        brace, cands = 0, []
        start_body = m.start() + len(prefix) + 1
        for j, ch in enumerate(body):
            if ch == '{': brace += 1
            elif ch == '}': brace -= 1
            elif ch == ' ' and brace == 0 and start_body + j + 2 <= LIMIT and j > 10:
                cands.append(j)
        if not cands: continue
        j = cands[-1]
        head = line[:start_body + j + 1] + q
        indent = len(line) - len(line.lstrip())
        tail = ' ' * (indent + 8) + prefix + q + body[j + 1:] + q + line[m.end():]
        return [head] + ([tail] if len(tail) <= LIMIT else split_string(tail, d))
    return [line]


def process(path):
    s = open(path, encoding='utf-8').read()

    def fix(m):
        out, depth, triple = [], 0, None
        for line in m.group(2).split('\n'):
            pieces = split_statements(line) if len(line) > LIMIT else [line]
            for p in pieces:
                start = depth
                _, depth, triple, _ = scan(p, depth, triple)
                out += split_string(p, start) if len(p) > LIMIT else [p]
        return m.group(1) + '\n'.join(out) + m.group(3)
    open(path, 'w', encoding='utf-8').write(re.sub(r'(```python[^\n]*\n)(.*?)(\n```)', fix, s, flags=re.S))


if __name__ == '__main__':
    for p in sys.argv[1:]: process(p)
