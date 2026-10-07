import os
import re
from xml.sax.saxutils import escape
import matplotlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, CondPageBreak, KeepTogether, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents

# DejaVu fonts ship with matplotlib (Windows has no system copy)
D = os.path.join(os.path.dirname(matplotlib.__file__), 'mpl-data', 'fonts', 'ttf') + os.sep
for n, f in [('DV', 'DejaVuSans.ttf'), ('DV-B', 'DejaVuSans-Bold.ttf'), ('DV-I', 'DejaVuSans-Oblique.ttf'),
             ('DV-BI', 'DejaVuSans-BoldOblique.ttf'), ('MONO', 'DejaVuSansMono.ttf'),
             ('MONO-B', 'DejaVuSansMono-Bold.ttf'), ('SERIF-B', 'DejaVuSerif-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(n, D + f))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('DV', normal='DV', bold='DV-B', italic='DV-I', boldItalic='DV-BI')
registerFontFamily('MONO', normal='MONO', bold='MONO-B', italic='MONO', boldItalic='MONO-B')

INK = colors.HexColor('#1d2433')
GREY = colors.HexColor('#5b6475')
LINE = colors.HexColor('#d6dbe4')
CODEBG = colors.HexColor('#f5f7fa')
CODEBORDER = colors.HexColor('#dde3ec')

THEMES = {
    'java': dict(accent=colors.HexColor('#b4461f'), soft=colors.HexColor('#fbefe9')),
    'sql': dict(accent=colors.HexColor('#1f5f8b'), soft=colors.HexColor('#e9f2f9')),
    'cn': dict(accent=colors.HexColor('#1d6f42'), soft=colors.HexColor('#e8f4ec')),
    'os': dict(accent=colors.HexColor('#a15c07'), soft=colors.HexColor('#fdf3e3')),
    'dl': dict(accent=colors.HexColor('#9d174d'), soft=colors.HexColor('#fcecf3')),
    'ai': dict(accent=colors.HexColor('#4338ca'), soft=colors.HexColor('#eef0fc')),
    'dsa': dict(accent=colors.HexColor('#0f6e64'), soft=colors.HexColor('#e7f4f2')),
    'db': dict(accent=colors.HexColor('#7c2d12'), soft=colors.HexColor('#fbefe9')),
    'lld': dict(accent=colors.HexColor('#4c1d95'), soft=colors.HexColor('#f1ecfb')),
    'hld': dict(accent=colors.HexColor('#0c4a6e'), soft=colors.HexColor('#e8f2f8')),
    'be': dict(accent=colors.HexColor('#3f6212'), soft=colors.HexColor('#f0f6e6')),
    'mlsd': dict(accent=colors.HexColor('#86198f'), soft=colors.HexColor('#f9ecfa')),
    'apt': dict(accent=colors.HexColor('#b91c1c'), soft=colors.HexColor('#fdeeee')),
    'hr': dict(accent=colors.HexColor('#334155'), soft=colors.HexColor('#eef1f5')),
    'jdbc': dict(accent=colors.HexColor('#0e7490'), soft=colors.HexColor('#e7f6f9')),
    'math': dict(accent=colors.HexColor('#1e40af'), soft=colors.HexColor('#ebf0fc')),
    'senior': dict(accent=colors.HexColor('#57534e'), soft=colors.HexColor('#f3f2f1')),
}

CALLOUTS = {
    'NOTE': ('Note', colors.HexColor('#2f6db5'), colors.HexColor('#eef4fb')),
    'TIP': ('Tip', colors.HexColor('#2e8b57'), colors.HexColor('#eef8f2')),
    'TRAP': ('Exam trap', colors.HexColor('#c0392b'), colors.HexColor('#fcefed')),
    'EXAM': ('Exam focus', colors.HexColor('#8e44ad'), colors.HexColor('#f5eefa')),
    'OUTPUT': ('Output', colors.HexColor('#5b6475'), colors.HexColor('#f3f4f6')),
}

JAVA_KW = set("""abstract assert boolean break byte case catch char class const continue default do double else enum
extends final finally float for goto if implements import instanceof int interface long native new package private
protected public return short static strictfp super switch synchronized this throw throws transient try void volatile
while var record yield sealed permits non-sealed true false null""".split())
PY_KW = set('''False None True and as assert async await break class continue def del elif else except finally for
from global if import in is lambda nonlocal not or pass raise return try while with yield self print len range'''.split())
SQL_KW = set("""select from where and or not insert into values update set delete create table database drop alter add
column primary key foreign references unique default null is in between like as on join inner left right full outer
cross group by having order asc desc limit offset distinct count sum avg min max union all exists case when then else
end int integer varchar char text date datetime timestamp decimal float double boolean auto_increment index view
procedure function begin declare return returns call trigger before after for each row grant revoke commit rollback
savepoint transaction start use show describe truncate modify rename to if engine check constraint cascade over
partition rank dense_rank row_number lead lag coalesce ifnull now curdate concat upper lower length substring round
with recursive any some natural using enum bigint tinyint smallint unsigned delimiter out inout new old signal
sqlstate message_text while do loop leave iterate cursor open fetch close continue handler found replace explain
lock tables read write isolation level committed repeatable serializable uncommitted session global""".split())

TOKEN_RE = re.compile(r'(//.*$|--.*$|#.*$|/\*.*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|\b\d+(?:\.\d+)?[LlFfDd]?\b|[A-Za-z_@][A-Za-z_0-9]*|\s+|.)')


def highlight(line, lang, theme):
    out = []
    kwc = '#a626a4' if lang == 'java' else '#0b57a4'
    for m in TOKEN_RE.finditer(line):
        t = m.group(0)
        if t.isspace():
            e = '&nbsp;' * len(t) if (len(t) > 1 or m.start() == 0) else ' '
        else:
            e = re.sub(r'  +', lambda mm: '&nbsp;' * len(mm.group(0)), escape(t))
        if lang in ('text', 'out'):
            out.append(e); continue
        if (t.startswith('//') and lang == 'java') or (t.startswith('--') and lang == 'sql') or t.startswith('/*') \
                or (t.startswith('#') and lang in ('sql', 'python')):
            out.append(f'<font color="#7a8291"><i>{e}</i></font>')
        elif t[0] in '"\'' and len(t) > 1:
            out.append(f'<font color="#2e7d32">{e}</font>')
        elif t[0].isdigit():
            out.append(f'<font color="#b05a00">{e}</font>')
        elif lang == 'java' and t in JAVA_KW:
            out.append(f'<font color="{kwc}"><b>{e}</b></font>')
        elif lang == 'java' and t.startswith('@'):
            out.append(f'<font color="#b05a00">{e}</font>')
        elif lang == 'python' and t in PY_KW:
            out.append(f'<font color="#7c3aed"><b>{e}</b></font>')
        elif lang == 'python' and t.startswith('@'):
            out.append(f'<font color="#b05a00">{e}</font>')
        elif lang == 'sql' and t.lower() in SQL_KW and (t.isupper() or t.islower()):
            out.append(f'<font color="{kwc}"><b>{e}</b></font>')
        else:
            out.append(e)
    return ''.join(out) or '&nbsp;'


def inline(s):
    s = escape(s)
    s = re.sub(r'&lt;(/?)(sub|sup)&gt;', r'<\1\2>', s)    # allow subscripts and superscripts
    parts = re.split(r'(`[^`]+`)', s)
    res = []
    for p in parts:
        if p.startswith('`') and p.endswith('`') and len(p) > 1:
            res.append('<font name="MONO" size="8.6" color="#9c2f12">' + p[1:-1] + '</font>')
        else:
            p = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', p)
            p = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', p)
            res.append(p)
    return ''.join(res)


class Doc(BaseDocTemplate):
    def __init__(self, path, title, theme, **kw):
        super().__init__(path, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=20 * mm,
                         bottomMargin=18 * mm, title=title, author='Prepared for Indrajeet', **kw)
        self.doc_title = title
        self.theme = theme
        fr = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f')
        self.addPageTemplates([PageTemplate('cover', [fr], onPage=self._cover),
                               PageTemplate('body', [fr], onPage=self._page)])
        self._bm = 0

    def beforeDocument(self):
        self._bm = 0

    def _cover(self, c, d):
        c.saveState()
        c.setFillColor(self.theme['accent'])
        c.rect(0, A4[1] - 88 * mm, A4[0], 88 * mm, stroke=0, fill=1)
        c.restoreState()

    def _page(self, c, d):
        c.saveState()
        c.setStrokeColor(LINE); c.setLineWidth(0.5)
        c.line(18 * mm, A4[1] - 13 * mm, A4[0] - 18 * mm, A4[1] - 13 * mm)
        c.setFont('DV', 7.5); c.setFillColor(GREY)
        c.drawString(18 * mm, A4[1] - 11 * mm, self.doc_title)
        c.drawRightString(A4[0] - 18 * mm, 10 * mm, f'Page {d.page}')
        c.setFillColor(self.theme['accent'])
        c.rect(18 * mm, 9.2 * mm, 12 * mm, 1.2 * mm, stroke=0, fill=1)
        c.restoreState()

    def afterFlowable(self, f):
        lvl = getattr(f, '_toc', None)
        if lvl is None:
            return
        text = f._plain
        key = f'bm{self._bm}'; self._bm += 1
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(text, key, level=lvl, closed=(lvl == 0))
        self.notify('TOCEntry', (lvl, text, self.page, key))


def styles(theme):
    A = theme['accent']
    S = {}
    S['body'] = ParagraphStyle('body', fontName='DV', fontSize=9.6, leading=14.2, textColor=INK, spaceAfter=5.5)
    S['h1'] = ParagraphStyle('h1', fontName='SERIF-B', fontSize=20, leading=25, textColor=A, spaceBefore=2,
                             spaceAfter=4)
    S['h1sub'] = ParagraphStyle('h1s', fontName='DV-I', fontSize=10, leading=14, textColor=GREY, spaceAfter=14)
    S['h2'] = ParagraphStyle('h2', fontName='DV-B', fontSize=13.2, leading=17, textColor=INK, spaceBefore=13,
                             spaceAfter=6)
    S['h3'] = ParagraphStyle('h3', fontName='DV-B', fontSize=10.6, leading=14, textColor=A, spaceBefore=8,
                             spaceAfter=4)
    S['bullet'] = ParagraphStyle('bl', parent=S['body'], leftIndent=14, bulletIndent=4, spaceAfter=3)
    S['code'] = ParagraphStyle('code', fontName='MONO', fontSize=8.1, leading=10.6, textColor=INK)
    S['codetitle'] = ParagraphStyle('ct', fontName='DV-B', fontSize=7.4, leading=9, textColor=GREY)
    S['cell'] = ParagraphStyle('cell', fontName='DV', fontSize=8.5, leading=11.3, textColor=INK)
    S['cellh'] = ParagraphStyle('cellh', fontName='DV-B', fontSize=8.5, leading=11.3, textColor=colors.white)
    S['call'] = ParagraphStyle('call', fontName='DV', fontSize=9.1, leading=13, textColor=INK)
    S['toc0'] = ParagraphStyle('toc0', fontName='DV-B', fontSize=10.5, leading=15, leftIndent=0, textColor=INK,
                               spaceBefore=6)
    S['toc1'] = ParagraphStyle('toc1', fontName='DV', fontSize=9, leading=12.5, leftIndent=14, textColor=GREY)
    return S


def code_block(lines, lang, S, title=None, width=None):
    if lang == 'out':
        bg, border = colors.HexColor('#f1f2f4'), colors.HexColor('#cfd3da')
    else:
        bg, border = CODEBG, CODEBORDER
    rows = []
    if title:
        rows.append([Paragraph(escape(title).upper(), S['codetitle'])])
    wrap = ParagraphStyle('codew', parent=S['code'], leftIndent=22, firstLineIndent=-22)
    for l in lines:
        ps = wrap if len(l.rstrip()) > 94 else S['code']
        rows.append([Paragraph(highlight(l.rstrip(), lang, None), ps)])
    t = Table(rows, colWidths=[width], hAlign='LEFT')
    st = [('BACKGROUND', (0, 0), (-1, -1), bg), ('LEFTPADDING', (0, 0), (-1, -1), 8),
          ('RIGHTPADDING', (0, 0), (-1, -1), 6), ('TOPPADDING', (0, 0), (-1, -1), 0),
          ('BOTTOMPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, 0), 5),
          ('BOTTOMPADDING', (0, -1), (-1, -1), 5), ('LINEBEFORE', (0, 0), (0, -1), 2.2, border),
          ('BOX', (0, 0), (-1, -1), 0.4, border)]
    if title:
        st.append(('BOTTOMPADDING', (0, 0), (-1, 0), 3))
    t.setStyle(TableStyle(st))
    return t


def callout(kind, text, S, width):
    label, col, bg = CALLOUTS[kind]
    p = Paragraph(f'<font name="DV-B" color="{col.hexval().replace("0x", "#")}">{label}.</font> ' + inline(text),
                  S['call'])
    t = Table([[p]], colWidths=[width])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('LINEBEFORE', (0, 0), (0, -1), 3, col),
                           ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                           ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 7)]))
    return t


def table(rows, S, theme, width):
    ncol = len(rows[0])
    lens = []
    for i in range(ncol):
        m = max(len(r[i]) if i < len(r) else 0 for r in rows)
        lens.append(min(max(m, 8), 55))
    tot = sum(lens)
    cw = [width * l / tot for l in lens]
    data = []
    for ri, r in enumerate(rows):
        r = r + [''] * (ncol - len(r))
        data.append([Paragraph(inline(c), S['cellh'] if ri == 0 else S['cell']) for c in r])
    t = Table(data, colWidths=cw, repeatRows=1, hAlign='LEFT')
    st = [('BACKGROUND', (0, 0), (-1, 0), theme['accent']), ('GRID', (0, 0), (-1, -1), 0.4, LINE),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 3.5),
          ('BOTTOMPADDING', (0, 0), (-1, -1), 4), ('LEFTPADDING', (0, 0), (-1, -1), 5)]
    for i in range(1, len(data)):
        if i % 2 == 0:
            st.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f7f8fa')))
    t.setStyle(TableStyle(st))
    return t


def heading(text, style, lvl):
    p = Paragraph(inline(text), style)
    p._toc = lvl
    p._plain = re.sub(r'[`*]', '', text)
    return p


def parse(src, S, theme, width, h1_count):
    story = []
    lines = src.split('\n')
    i = 0
    para = []

    def flush():
        if para:
            story.append(Paragraph(inline(' '.join(para)), S['body']))
            para.clear()

    while i < len(lines):
        ln = lines[i]
        s = ln.strip()
        if s.startswith('```'):
            flush()
            hdr = s[3:].strip().split(None, 1)
            lang = hdr[0] if hdr else 'text'
            title = hdr[1] if len(hdr) > 1 else None
            i += 1
            buf = []
            while not lines[i].strip().startswith('```'):
                buf.append(lines[i].expandtabs(4)); i += 1
            i += 1
            cb = code_block(buf, lang, S, title, width)
            prev = story[-2] if len(story) >= 2 else None
            if (lang == 'out' and prev is not None and getattr(prev, '_raw', None) is not None
                    and prev._n + len(buf) <= 42):
                story[-2:] = [KeepTogether([prev._raw, Spacer(1, 7), cb])]
            elif len(buf) <= 22:
                kt = KeepTogether([cb]); kt._raw = cb; kt._n = len(buf); story.append(kt)
            else:
                story.append(cb)
            story.append(Spacer(1, 7))
            continue
        mimg = re.match(r'!\[(.*?)\]\((.*?)\)', s)
        if mimg:
            flush()
            from reportlab.platypus import Image as RLImage
            from reportlab.lib.utils import ImageReader
            path = mimg.group(2)
            iw, ih = ImageReader(path).getSize()
            iw_pt = iw * 72 / 150                      # figures are saved at 150 dpi
            w = min(width * 0.86, iw_pt * 1.1); h = w * ih / iw
            img = RLImage(path, width=w, height=h)
            cap = Paragraph(inline(mimg.group(1)), ParagraphStyle('cap', fontName='DV-I', fontSize=8.2, leading=11,
                                                                  textColor=GREY, alignment=TA_CENTER))
            story.append(KeepTogether([img, Spacer(1, 3), cap]))
            story.append(Spacer(1, 9)); i += 1
            continue
        if s == '---page':
            flush(); story.append(PageBreak()); i += 1; continue
        if s.startswith('# '):
            flush()
            if h1_count[0] > 0:
                story.append(PageBreak())
            h1_count[0] += 1
            story.append(heading(s[2:], S['h1'], 0))
            i += 1
            if i < len(lines) and lines[i].startswith('%'):
                story.append(Paragraph(inline(lines[i][1:].strip()), S['h1sub'])); i += 1
            else:
                story.append(Spacer(1, 8))
            continue
        if s.startswith('## '):
            flush(); story.append(CondPageBreak(45 * mm))
            story.append(heading(s[3:], S['h2'], 1)); i += 1; continue
        if s.startswith('### '):
            flush(); story.append(CondPageBreak(30 * mm))
            story.append(Paragraph(inline(s[4:]), S['h3'])); i += 1; continue
        if s.startswith('> '):
            flush()
            m = re.match(r'> (NOTE|TIP|TRAP|EXAM|OUTPUT): ?(.*)', s)
            kind, text = (m.group(1), m.group(2)) if m else ('NOTE', s[2:])
            i += 1
            while i < len(lines) and lines[i].strip().startswith('> ') and not re.match(
                    r'> (NOTE|TIP|TRAP|EXAM|OUTPUT):', lines[i].strip()):
                text += ' ' + lines[i].strip()[2:]; i += 1
            story.append(callout(kind, text, S, width)); story.append(Spacer(1, 7))
            continue
        if s.startswith('|'):
            flush()
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                r = lines[i].strip().strip('|')
                cells = [c.strip() for c in re.split(r'(?<!\\)\|', r)]
                cells = [c.replace('\\|', '|') for c in cells]
                if not all(re.fullmatch(r':?-{2,}:?', c) for c in cells):
                    rows.append(cells)
                i += 1
            story.append(table(rows, S, theme, width)); story.append(Spacer(1, 8))
            continue
        m = re.match(r'(- |\d+\. )(.*)', s)
        if m:
            flush()
            num = m.group(1).strip()
            text = m.group(2)
            i += 1
            while i < len(lines) and lines[i].startswith('  ') and lines[i].strip() and not re.match(
                    r'(- |\d+\. )', lines[i].strip()):
                text += ' ' + lines[i].strip(); i += 1
            b = '•' if num == '-' else num
            story.append(Paragraph(inline(text), S['bullet'], bulletText=b))
            if not (i < len(lines) and re.match(r'(- |\d+\. )', lines[i].strip())):
                story.append(Spacer(1, 3))
            continue
        if not s:
            flush(); i += 1; continue
        para.append(s); i += 1
    flush()
    return story


def build(path, title, subtitle, theme_name, intro_rows, src, kicker):
    theme = THEMES[theme_name]
    doc = Doc(path, title, theme)
    S = styles(theme)
    W = doc.width
    story = []
    # cover
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph(kicker.upper(), ParagraphStyle('k', fontName='DV-B', fontSize=9, leading=12,
                                                           textColor=colors.HexColor('#ffffffcc'))))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(title, ParagraphStyle('ct', fontName='SERIF-B', fontSize=27, leading=33,
                                                  textColor=colors.white)))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(subtitle, ParagraphStyle('cs', fontName='DV', fontSize=11.5, leading=16,
                                                     textColor=colors.white)))
    story.append(Spacer(1, 30 * mm))
    story.append(table(intro_rows, S, theme, W))
    story.append(NextPageTemplate('body'))
    story.append(PageBreak())
    toc = TableOfContents()
    toc.levelStyles = [S['toc0'], S['toc1']]
    toc.dotsMinLevel = 0
    story.append(Paragraph('Contents', S['h1']))
    story.append(Spacer(1, 6))
    story.append(toc)
    story.append(PageBreak())
    story += parse(src, S, theme, W, [0])
    doc.multiBuild(story)
    return doc
