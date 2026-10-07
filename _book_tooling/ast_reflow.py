import re, ast, sys, subprocess


def blocks(s): return re.findall(r'```python[^\n]*\n(.*?)\n```', s, re.S)


for f in sys.argv[1:]:
    before = blocks(open(f, encoding='utf-8').read())
    subprocess.run([sys.executable, 'pyreflow.py', f], check=True)
    subprocess.run([sys.executable, 'pystr.py', f], check=True)
    after = blocks(open(f, encoding='utf-8').read())
    assert len(before) == len(after), f
    bad = []
    for i, (a, b) in enumerate(zip(before, after)):
        try:
            if ast.dump(ast.parse(a)) != ast.dump(ast.parse(b)): bad.append(i)
        except SyntaxError as e:
            bad.append((i, 'syntax', str(e)))
    long = [l for blk in after for l in blk.split('\n') if len(l) > 94]
    print(f, 'blocks', len(after), 'AST mismatches', bad, 'long lines left', len(long))
    for l in long: print('   LONG', l.rstrip()[:115])
