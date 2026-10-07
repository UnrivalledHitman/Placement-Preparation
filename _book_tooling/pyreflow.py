import re, sys
LIMIT = 92


def scan(line, depth0, in_triple):
    """Return (breakpoints, depth_after, triple_after, comment_pos) for one line."""
    pts, depth, i, s, triple = [], depth0, 0, None, in_triple
    comment = None
    while i < len(line):
        if triple:
            if line.startswith(triple, i): i += 3; triple = None; continue
            i += 1; continue
        c = line[i]
        if s:
            if c == '\\': i += 2; continue
            if c == s: s = None
            i += 1; continue
        if line.startswith('"""', i) or line.startswith("'''", i):
            triple = line[i:i + 3]; i += 3; continue
        if c in '"\'': s = c; i += 1; continue
        if c == '#': comment = i; break
        if c in '([{': depth += 1
        elif c in ')]}': depth -= 1
        elif depth > 0:
            if line.startswith(', ', i): pts.append((i + 1, 'after'))
            elif line.startswith(' + ', i) or line.startswith(' and ', i) or line.startswith(' or ', i) \
                    or line.startswith(' if ', i) or line.startswith(' for ', i) or line.startswith(' else ', i):
                pts.append((i, 'before'))
        i += 1
    return pts, depth, triple, comment


def reflow_block(lines):
    out, depth, triple = [], 0, None
    for line in lines:
        start_depth, start_triple = depth, triple
        _, depth, triple, comment = scan(line, depth, triple)
        if len(line) <= LIMIT or start_triple:
            out.append(line); continue
        indent = len(line) - len(line.lstrip())
        code, cmt = (line[:comment].rstrip(), line[comment:]) if comment is not None and line[:comment].strip() \
            else (line, None)
        if cmt:
            if len(code) + 3 + len(cmt) <= LIMIT:
                out.append(code + '   ' + cmt); continue
            out.append(' ' * indent + cmt)
        cur, first = code, True
        cont = ' ' * (indent + 8)
        d = start_depth
        while len(cur) > LIMIT:
            pts, _, _, _ = scan(cur, d, None)
            lead = len(cur) - len(cur.lstrip())
            pts = [p for p in pts if lead + 12 < p[0] <= LIMIT]
            if not pts: break
            pos, kind = pts[-1]
            head = cur[:pos].rstrip()
            tail = cur[pos:].lstrip()
            _, d, _, _ = scan(cur[:pos], d, None)
            out.append(head)
            cur = cont + tail
            first = False
        out.append(cur)
    return out


def process(path):
    s = open(path, encoding='utf-8').read()

    def fix(m):
        return m.group(1) + '\n'.join(reflow_block(m.group(2).split('\n'))) + m.group(3)
    open(path, 'w', encoding='utf-8').write(re.sub(r'(```python[^\n]*\n)(.*?)(\n```)', fix, s, flags=re.S))


if __name__ == '__main__':
    for p in sys.argv[1:]: process(p)
