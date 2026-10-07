"""Contact sheet of a PDF: python sheet.py file.pdf out.png [first last]"""
import os, subprocess, sys, glob
os.chdir(os.path.dirname(os.path.abspath(__file__)))
pdf, out = sys.argv[1], sys.argv[2]
rng = sys.argv[3:5]
d = os.path.join('tmp', 'sheet'); os.makedirs(d, exist_ok=True)
for f in glob.glob(os.path.join(d, '*.png')):
    os.remove(f)
args = ['pdftoppm', '-r', '40', '-png'] + (['-f', rng[0], '-l', rng[1]] if rng else []) + \
    [pdf, os.path.join(d, 'p')]
subprocess.run(args, check=True)
pngs = sorted(glob.glob(os.path.join(d, 'p-*.png')))
html = os.path.abspath(os.path.join(d, 'sheet.html'))
with open(html, 'w') as fh:
    fh.write('<body style="margin:0;background:#777;display:grid;'
             'grid-template-columns:repeat(8,1fr);gap:5px;padding:5px">')
    for p in pngs:
        n = os.path.basename(p).split('-')[1].split('.')[0]
        fh.write(f'<div style="position:relative"><img src="{os.path.basename(p)}" '
                 f'style="width:100%;display:block"><b style="position:absolute;top:1px;left:3px;'
                 f'background:#ff0;font:11px sans-serif">{n}</b></div>')
rows = -(-len(pngs) // 8)
edge = os.path.join(os.environ['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe')
url = 'file:///' + html.replace(os.sep, '/')
subprocess.run([edge, '--headless', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=10000',
                '--allow-file-access-from-files',
                '--user-data-dir=' + os.path.abspath(os.path.join('tmp', 'edge')),
                f'--window-size=1600,{rows * 290 + 20}', '--screenshot=' + os.path.abspath(out), url],
               stderr=subprocess.DEVNULL)
print('pages', len(pngs), '->', out)
