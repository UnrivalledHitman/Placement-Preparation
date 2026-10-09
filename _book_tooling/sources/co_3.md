# Chapter 8: Lexical Analysis
%The phases of a compiler, and turning characters into tokens with a DFA built from regular expressions

## 8.1 The phases of a compiler

| Phase | Input → output | Theory behind it |
|---|---|---|
| Lexical analysis | Characters → tokens | Regular expressions, DFAs (Chapters 1–3) |
| Parsing | Tokens → syntax tree | Context-free grammars, LL/LR parsing (Chapters 4–5) |
| Semantic analysis | Tree → checked tree (scopes, types) | Symbol tables, type systems |
| Intermediate code generation | Tree → IR (bytecode, three-address code, SSA) | Syntax-directed translation |
| Optimisation | IR → better IR | Data-flow analysis, constant folding, dead code, liveness |
| Code generation | IR → machine code or bytecode | Instruction selection, register allocation |

Chapters 8–10 build all of these for **Mini**, a small language with integers, booleans, variables, `if`/`else`, `while`, functions with recursion, and `print`:

```text
fn fib(n) {
    if (n < 2) { return n; }
    return fib(n - 1) + fib(n - 2);
}
let i = 0;
while (i < 10) { print fib(i); i = i + 1; }
```

## 8.2 A lexer from regular expressions

A **lexer** (scanner) groups characters into **tokens**: numbers, identifiers, keywords, operators. Each token class is a regular expression; together they form one big alternation, which a regex engine (or a generated DFA, as in `lex` and `flex`) matches repeatedly. Two rules resolve ambiguity: **maximal munch** (take the longest match, so `<=` is one token, not `<` then `=`) and **priority** (when lengths tie, keywords win over identifiers).

```python run The Mini lexer (saved as mini_lex.py)
import re
from dataclasses import dataclass

KEYWORDS = {'let', 'fn', 'if', 'else', 'while', 'return', 'print', 'true', 'false'}
TOKEN_SPEC = [
    ('SKIP', r'[ \t\r]+|//[^\n]*'),          # spaces and comments: before '/' is tried
    ('NUM',  r'\d+'),
    ('ID',   r'[A-Za-z_]\w*'),
    ('OP',   r'==|!=|<=|>=|&&|\|\||[-+*/%<>=!(){};,]'),      # longer operators first
    ('NL',   r'\n'),
    ('BAD',  r'.'),
]
MASTER = re.compile('|'.join(f'(?P<{name}>{rx})' for name, rx in TOKEN_SPEC))

@dataclass
class Token:
    kind: str          # NUM, ID, KW, OP or EOF
    text: str
    line: int
    col: int

class CompileError(Exception):
    pass

def tokenize(src):
    tokens, line, line_start = [], 1, 0
    for m in MASTER.finditer(src):
        kind, text, col = m.lastgroup, m.group(), m.start() - line_start + 1
        if kind == 'NL':
            line, line_start = line + 1, m.end()
        elif kind == 'BAD':
            raise CompileError(f'{line}:{col}: unexpected character {text!r}')
        elif kind != 'SKIP':
            if kind == 'ID' and text in KEYWORDS:
                kind = 'KW'
            tokens.append(Token(kind, text, line, col))
    tokens.append(Token('EOF', '', line, 1))
    return tokens

if __name__ == '__main__':
    import inspect
    open('mini_lex.py', 'w').write('import re\nfrom dataclasses import dataclass\n\n'
            + '\n'.join(
        f'{n} = {globals()[n]!r}' for n in ('KEYWORDS', 'TOKEN_SPEC')) + '\n' +
        "MASTER = re.compile('|'.join(f'(?P<{name}>{rx})' for name, rx in TOKEN_SPEC))\n\n" +
        '\n\n'.join(inspect.getsource(o) for o in (Token, CompileError, tokenize)))

    src = 'let x1 = 42;\nif (x1 <= 50 && !done) { print x1 * 2; } // comment'
    toks = [f'{t.kind}:{t.text}' for t in tokenize(src) if t.kind != 'EOF']
    for i in range(0, len(toks), 9):
        print(' '.join(toks[i:i + 9]))
    try:
        tokenize('let price = 10;\nlet tax = price # 2;')
    except CompileError as e:
        print('lexical error ->', e)
```

The lexer reports positions as `line:column`, which every later error message reuses. Note how `x1` is one identifier, `<=` and `&&` are single operators, `if` and `print` are keywords, and the comment vanished. Python's `re` takes the **first** alternative that matches rather than the longest, so order matters: two-character operators are listed before one-character ones, and comments come before operators. The first version of this lexer listed `SKIP` after `OP`, and the comment came out as the tokens `/ / comment`, a real instance of the problem. A DFA-based generator (`flex`) implements maximal munch directly and would have taken the longer `//...` match.

## 8.3 Practical lessons

- A compiler is a pipeline: lex, parse, check, generate IR, optimise, generate code.
- Each token class is a regular expression; a lexer is the DFA for their union, with maximal munch and keyword priority.
- Keep line and column in every token so that all later phases can report precise errors.

# Chapter 9: Parsing to a Syntax Tree and Semantic Analysis
%Recursive descent with precedence climbing, abstract syntax trees, scopes, symbol tables and type checking

## 9.1 Recursive descent with precedence climbing

The parser turns tokens into an **abstract syntax tree** (AST): the program's structure without punctuation. Statements are parsed by recursive descent, one function per construct. Expressions use **precedence climbing**: parse an operand, then repeatedly absorb operators whose precedence is at least the current minimum, parsing the right operand with a higher minimum, which makes operators left-associative and gives `*` priority over `+` without a layered grammar (Chapter 4).

```python run The Mini parser (saved as mini_parse.py)
from mini_lex import tokenize, CompileError

PREC = {'||': 1, '&&': 2, '==': 3, '!=': 3, '<': 4, '<=': 4, '>': 4, '>=': 4,
        '+': 5, '-': 5, '*': 6, '/': 6, '%': 6}

class Parser:
    def __init__(self, tokens):
        self.toks, self.i = tokens, 0

    def peek(self, k=0):
        return self.toks[min(self.i + k, len(self.toks) - 1)]

    def advance(self):
        tok = self.peek(); self.i += 1; return tok

    def at(self, text):
        tok = self.peek()
        return tok.kind in ('OP', 'KW') and tok.text == text

    def expect(self, text):
        tok = self.advance()
        if tok.kind not in ('OP', 'KW') or tok.text != text:
            raise CompileError(f'{tok.line}:{tok.col}: expected {text!r}, '
                               f'found {tok.text or "end of input"!r}')
        return tok

    def name(self):
        tok = self.advance()
        if tok.kind != 'ID':
            raise CompileError(f'{tok.line}:{tok.col}: expected a name, found {tok.text!r}')
        return tok

    def program(self):
        stmts = []
        while self.peek().kind != 'EOF':
            stmts.append(self.statement())
        return stmts

    def block(self):
        self.expect('{')
        stmts = []
        while not self.at('}'):
            if self.peek().kind == 'EOF':
                raise CompileError(f'{self.peek().line}:1: missing closing brace')
            stmts.append(self.statement())
        self.expect('}')
        return stmts

    def statement(self):
        tok = self.peek()
        if self.at('let'):
            self.advance(); n = self.name(); self.expect('=')
            e = self.expr(); self.expect(';')
            return ('let', n.text, e, tok.line)
        if self.at('fn'):
            self.advance(); n = self.name(); self.expect('(')
            params = []
            while not self.at(')'):
                params.append(self.name().text)
                if not self.at(')'):
                    self.expect(',')
            self.expect(')')
            return ('fn', n.text, params, self.block(), tok.line)
        if self.at('if'):
            self.advance(); self.expect('('); cond = self.expr(); self.expect(')')
            then, other = self.block(), []
            if self.at('else'):
                self.advance()
                other = [self.statement()] if self.at('if') else self.block()
            return ('if', cond, then, other, tok.line)
        if self.at('while'):
            self.advance(); self.expect('('); cond = self.expr(); self.expect(')')
            return ('while', cond, self.block(), tok.line)
        if self.at('return'):
            self.advance(); e = self.expr(); self.expect(';')
            return ('return', e, tok.line)
        if self.at('print'):
            self.advance(); e = self.expr(); self.expect(';')
            return ('print', e, tok.line)
        if tok.kind == 'ID' and self.peek(1).text == '=':
            self.advance(); self.advance(); e = self.expr(); self.expect(';')
            return ('assign', tok.text, e, tok.line)
        e = self.expr(); self.expect(';')
        return ('expr', e, tok.line)

    def expr(self, min_prec=1):
        left = self.unary()
        while True:
            tok = self.peek()
            prec = PREC.get(tok.text) if tok.kind == 'OP' else None
            if prec is None or prec < min_prec:
                return left
            self.advance()
            left = ('bin', tok.text, left, self.expr(prec + 1), tok.line)

    def unary(self):
        tok = self.peek()
        if tok.kind == 'OP' and tok.text in ('-', '!'):
            self.advance()
            return ('un', tok.text, self.unary(), tok.line)
        return self.primary()

    def primary(self):
        tok = self.advance()
        if tok.kind == 'NUM':
            return ('num', int(tok.text))
        if tok.kind == 'KW' and tok.text in ('true', 'false'):
            return ('bool', tok.text == 'true')
        if tok.kind == 'ID':
            if self.at('('):
                self.advance(); args = []
                while not self.at(')'):
                    args.append(self.expr())
                    if not self.at(')'):
                        self.expect(',')
                self.expect(')')
                return ('call', tok.text, args, tok.line)
            return ('var', tok.text, tok.line)
        if tok.kind == 'OP' and tok.text == '(':
            e = self.expr(); self.expect(')'); return e
        raise CompileError(f'{tok.line}:{tok.col}: unexpected '
                f'{tok.text or "end of input"!r}')

def parse(src):
    return Parser(tokenize(src)).program()

def show(node):
    """Compact s-expression form of an expression tree, for display."""
    kind = node[0]
    if kind in ('num', 'bool'):
        return str(node[1]).lower()
    if kind == 'var':
        return node[1]
    if kind == 'un':
        return f'({node[1]} {show(node[2])})'
    if kind == 'call':
        return f'({node[1]} ' + ' '.join(show(a) for a in node[2]) + ')'
    return f'({node[1]} {show(node[2])} {show(node[3])})'

if __name__ == '__main__':
    import inspect
    open('mini_parse.py', 'w').write(
        'from mini_lex import tokenize, CompileError\n\n' + f'PREC = {PREC!r}\n\n' +
        '\n\n'.join(inspect.getsource(o) for o in (Parser, parse, show)))
    for text in ['1 + 2 * 3', '(1 + 2) * 3', '10 - 4 - 3',
            'a < b && !done || f(x, 2) == 7']:
        print(f'{text:<30} {show(parse(text + ";")[0][1])}')
    for bad in ['let = 5;', 'print (1 + 2;', 'while (x > 0) { x = x - 1;']:
        try:
            parse(bad)
        except CompileError as e:
            print(f'{bad:<30} syntax error -> {e}')
```

`10 - 4 - 3` parses as `((10 - 4) - 3)`, left-associative, and `*` binds tighter than `+` exactly as the layered grammar of Chapter 4 prescribes, but with one loop and a table. Syntax errors carry positions from the lexer.

## 9.2 Semantic analysis: scopes and types

The parser accepts `print x + true;` because it is grammatical. **Semantic analysis** rejects it: it builds **symbol tables** (which names exist in which scope, with what type) and checks types. Mini's rules: variables must be declared before use and not redeclared in the same block; arithmetic needs integers; comparisons give booleans; `if` and `while` conditions must be booleans; functions take and return integers, see only their own parameters and locals (Mini has no global variables inside functions), and calls must match the number of parameters. The checker collects **all** errors rather than stopping at the first.

```python run The Mini type checker (saved as mini_check.py)
from mini_parse import parse

ARITH, COMPARE, LOGIC = {'+', '-', '*', '/', '%'}, {'<', '<=', '>', '>='}, {'&&', '||'}

def check(program):
    errors = []
    # allow calls before definition
    funcs = {s[1]: len(s[2]) for s in program if s[0] == 'fn'}

    def expr_type(e, scopes):
        kind = e[0]
        if kind == 'num':
            return 'int'
        if kind == 'bool':
            return 'bool'
        if kind == 'var':
            for scope in reversed(scopes):
                if e[1] in scope:
                    return scope[e[1]]
            errors.append(f'line {e[2]}: undefined variable {e[1]!r}'); return 'int'
        if kind == 'un':
            t, want = expr_type(e[2], scopes), ('int' if e[1] == '-' else 'bool')
            if t != want:
                errors.append(f'line {e[3]}: {e[1]!r} needs {want}, got {t}')
            return want
        if kind == 'call':
            if e[1] not in funcs:
                errors.append(f'line {e[3]}: undefined function {e[1]!r}')
            elif funcs[e[1]] != len(e[2]):
                errors.append(f'line {e[3]}: {e[1]} expects {funcs[e[1]]} argument(s), '
                              f'got {len(e[2])}')
            for a in e[2]:
                if expr_type(a, scopes) != 'int':
                    errors.append(f'line {e[3]}: arguments must be int')
            return 'int'
        op, lt, rt = e[1], expr_type(e[2], scopes), expr_type(e[3], scopes)
        if op in ARITH or op in COMPARE:
            if (lt, rt) != ('int', 'int'):
                errors.append(f'line {e[4]}: {op!r} needs int operands, got {lt} and {rt}')
            return 'int' if op in ARITH else 'bool'
        if op in LOGIC:
            if (lt, rt) != ('bool', 'bool'):
                errors.append(f'line {e[4]}: {op!r} needs bool operands, got {lt} and {rt}')
            return 'bool'
        if lt != rt:                                              # == and !=
            errors.append(f'line {e[4]}: cannot compare {lt} with {rt}')
        return 'bool'

    def block(stmts, scopes, in_fn):
        scopes = scopes + [{}]
        for s in stmts:
            kind = s[0]
            if kind == 'let':
                t = expr_type(s[2], scopes)
                if s[1] in scopes[-1]:
                    errors.append(f'line {s[3]}: {s[1]!r} already declared in this block')
                scopes[-1][s[1]] = t
            elif kind == 'assign':
                found = next((sc for sc in reversed(scopes) if s[1] in sc), None)
                t = expr_type(s[2], scopes)
                if found is None:
                    errors.append(f'line {s[3]}: assignment to undeclared {s[1]!r}')
                elif found[s[1]] != t:
                    errors.append(f'line {s[3]}: {s[1]!r} is {found[s[1]]}, cannot assign '
                            f'{t}')
            elif kind == 'fn':
                if in_fn:
                    errors.append(f'line {s[4]}: functions must be declared at top level')
                block(s[3], [{p: 'int' for p in s[2]}], True)
            elif kind in ('if', 'while'):
                if expr_type(s[1], scopes) != 'bool':
                    errors.append(f'line {s[-1]}: {kind} condition must be bool')
                block(s[2], scopes, in_fn)
                if kind == 'if':
                    block(s[3], scopes, in_fn)
            elif kind == 'return':
                if not in_fn:
                    errors.append(f'line {s[2]}: return outside a function')
                elif expr_type(s[1], scopes) != 'int':
                    errors.append(f'line {s[2]}: functions return int')
            else:                                                 # print, expr
                expr_type(s[1], scopes)

    block(program, [], False)
    return errors

if __name__ == '__main__':
    module = open(__file__, encoding='utf-8').read().split("if __name__ ==")[0]
    open('mini_check.py', 'w', encoding='utf-8').write(module)
    good = 'fn sq(n) { return n * n; }\nlet x = 3;\nif (sq(x) > 5) { print true; }'
    print('valid program errors:', check(parse(good)))
    bad = '''let x = 1;
let x = 2;
print y + 1;
if (x) { print x; }
let ok = x < 3 && 5;
fn add(a, b) { return a + b; }
print add(1);
z = 4;
return 7;
fn peek() { return x; }'''
    for err in check(parse(bad)):
        print(err)
```

Ten lines produced eight distinct errors, each with its line number, in a single pass: redeclaration, an undefined variable, a non-boolean condition, a mistyped `&&`, a wrong number of arguments, assignment to an undeclared name, a `return` outside a function, and a function reading the top-level `x`, which Mini functions cannot see. (An early version of this checker let functions see top-level variables while the code generator of Chapter 10 did not support them; the practice book exposed the mismatch, and the rule now lives in the checker, where such decisions belong.) Scopes are a stack of dictionaries: entering a block pushes one, and lookups search from the innermost outwards, which is also how shadowing works.

## 9.3 Recovering from syntax errors

Mini's parser stops at the first syntax error, which is acceptable for a teaching compiler but irritating in practice: a missing `;` on line 3 should not hide the errors on lines 10 and 20. Production parsers **recover** and keep going:

| Strategy | How it works | Used in |
|---|---|---|
| Panic mode | Discard tokens until a synchronising token (`;`, `}`, a keyword that starts a statement), then resume | Most hand-written recursive-descent parsers (GCC, Clang, javac) |
| Phrase-level repair | Insert or delete one token (a missing `;` or `)`) and continue, with a "did you mean" message | IDE parsers, Rust and TypeScript compilers |
| Error productions | Grammar rules that match common mistakes and produce a targeted message | yacc/Bison grammars |
| Error-tolerant trees | Build a tree with "error" nodes so that later phases and editor features still work | Language servers (IDE completion while you type) |

The art is to avoid **cascades**: one real mistake producing dozens of spurious follow-on errors. Synchronising at statement boundaries and suppressing errors near a previous one are the usual remedies.

## 9.4 Practical lessons

- Recursive descent maps each grammar rule to a function; precedence climbing handles operators with a table.
- An AST keeps structure and positions and drops punctuation.
- Semantic analysis uses a stack of symbol tables for scopes and enforces type rules the grammar cannot express.
- Collect all errors in one pass and report them with positions.
