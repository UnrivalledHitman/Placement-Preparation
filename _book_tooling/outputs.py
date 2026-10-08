"""Run every block in the given markdown files and print each block's title and output.
Usage: python outputs.py db_0.md [filter-substring]"""
import os, re, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import javarun, pyrun, shrun, webrun

f = sys.argv[1]
flt = sys.argv[2] if len(sys.argv) > 2 else None
s = open(f, encoding='utf-8').read()
s = webrun.expand(shrun.expand(javarun.expand(pyrun.expand(s, f.replace('.md', ''))), f.replace('.md', '')))
for m in re.finditer(r'```(?:python|java|bash|javascript|typescript|html)( [^\n]*)?\n(.*?)\n```\n```out Output\n(.*?)\n```', s, re.S):
    title = (m.group(1) or '').strip() or m.group(2).split('\n')[0][:60]
    if flt and flt.lower() not in (title + m.group(2)).lower():
        continue
    print(f'=== {title}')
    print(m.group(3))
