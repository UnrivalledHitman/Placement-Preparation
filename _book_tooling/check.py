"""Quality checks for markdown sources: long code lines, exercise/tracker counts, hint and solution coverage.
Usage: python check.py file1.md file2.md ..."""
import re, sys

src = '\n'.join(open(f, encoding='utf-8').read() for f in sys.argv[1:])
long = []
for m in re.finditer(r'```(\w+)[^\n]*\n(.*?)\n```', src, re.S):
    for l in m.group(2).split('\n'):
        if len(l.rstrip()) > 94:
            long.append(l.rstrip())
print('code blocks:', len(re.findall(r'^```(?:python|java|sql|text)', src, re.M)),
      '| runnable:', len(re.findall(r'^```(?:python run|java run|java spring)', src, re.M)), '| long lines:', len(long))
for l in long:
    print('   LONG', len(l), l[:110])
ex = re.findall(r'^\*\*([A-Z]\d+\.\d+) · ', src, re.M)
if ex:
    sols = set(re.findall(r'^### ([A-Z]\d+\.\d+) ', src, re.M))
    hints = set(re.findall(r'^\| ([A-Z]\d+\.\d+) \|', src, re.M))
    dup = sorted({e for e in ex if ex.count(e) > 1})
    print('exercises:', len(ex), '| solutions:', len(sols), '| hints:', len(hints), '| duplicates:', dup)
    print('missing solutions:', [e for e in ex if e not in sols])
    print('missing hints:', [e for e in ex if e not in hints])
