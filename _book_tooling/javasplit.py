"""Split over-long Java lines that pack several statements: python javasplit.py files...
Handles: one-line blocks `head { a; b; }`, `if (cond) stmt;`, and `a; b;` sequences.
Always rerun the code afterwards and diff outputs (outputs.py)."""
import re, sys
LIMIT = 94


def top_level_splits(s, sep):
    """Indices of sep at bracket depth 0, outside strings and chars."""
    out, depth, q, i = [], 0, None, 0
    while i < len(s):
        c = s[i]
        if q:
            if c == '\\': i += 2; continue
            if c == q: q = None
        elif c in '"\'': q = c
        elif c in '([{': depth += 1
        elif c in ')]}': depth -= 1
        elif depth == 0 and s.startswith(sep, i): out.append(i)
        i += 1
    return out


def matching_paren(s, start):
    depth, q = 0, None
    for i in range(start, len(s)):
        c = s[i]
        if q:
            if c == q and s[i - 1] != '\\': q = None
        elif c in '"\'': q = c
        elif c == '(': depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0: return i
    return -1


def split_line(line):
    if len(line) <= LIMIT or line.strip().startswith('//'):
        return [line]
    ind = line[:len(line) - len(line.lstrip())]
    body = line.strip()
    # one-line block: head { stmts }   (only if braces are the outermost of the line tail)
    m = re.match(r'^(.*?\{) (.*;) \}$', body)
    if m and top_level_splits(m.group(2), '}') == [] and m.group(1).count('{') == 1:
        stmts = [x.strip() for x in split_statements(m.group(2))]
        return [ind + m.group(1)] + sum((split_line(ind + '    ' + s) for s in stmts), []) + [ind + '}']
    # if (...) stmt;
    m = re.match(r'^(if|for|while) \(', body)
    if m:
        close = matching_paren(body, body.index('('))
        rest = body[close + 1:].strip()
        if close > 0 and rest and not rest.startswith('{'):
            return [ind + body[:close + 1]] + split_line(ind + '    ' + rest)
    # a; b; c;
    parts = split_statements(body)
    if len(parts) > 1 and '{' not in body:
        return sum((split_line(ind + p.strip()) for p in parts), [])
    return [line]


def split_statements(s):
    idx = top_level_splits(s, '; ')
    if not idx:
        return [s]
    out, prev = [], 0
    for i in idx:
        out.append(s[prev:i + 1]); prev = i + 2
    out.append(s[prev:])
    return [p for p in out if p.strip()]


def process(path):
    src = open(path, encoding='utf-8').read()

    def fix(m):
        lines = []
        for l in m.group(2).split('\n'):
            lines += split_line(l)
        return m.group(1) + '\n'.join(lines) + m.group(3)
    open(path, 'w', encoding='utf-8').write(re.sub(r'(```java[^\n]*\n)(.*?)(\n```)', fix, src, flags=re.S))


if __name__ == '__main__':
    for p in sys.argv[1:]:
        process(p)
