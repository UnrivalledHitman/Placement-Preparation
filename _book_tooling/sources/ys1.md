# Solutions
%Every automaton, grammar, machine and compiler extension implemented and tested against an independent definition

## Part 1 solutions

### Y1.1 No two a's in a row, even length

```python run Product of a parity DFA and a "no aa" DFA
from itertools import product

parity = {('even', c): 'odd' for c in 'ab'} | {('odd', c): 'even' for c in 'ab'}
no_aa = {('ok', 'a'): 'last_a', ('ok', 'b'): 'ok', ('last_a', 'a'): 'dead',
         ('last_a', 'b'): 'ok', ('dead', 'a'): 'dead', ('dead', 'b'): 'dead'}

def accepts(w):
    p, q = 'even', 'ok'   # the product state is the pair (p, q)
    for c in w:
        p, q = parity[(p, c)], no_aa[(q, c)]
    return p == 'even' and q != 'dead'

words = [''.join(t) for n in range(13) for t in product('ab', repeat=n)]
print('product states: 2 x 3 = 6')
print('agrees with the definition on', len(words), 'strings:',
      all(accepts(w) == (len(w) % 2 == 0 and 'aa' not in w) for w in words))
print([w for w in words if accepts(w)][:8])
```

### Y1.2 From NFA to minimal DFA

```python run An NFA with two guessing branches, determinised and minimised
from itertools import product
from automata import NFA, EPS, subset_construction, minimise, dfa_accepts

delta = {(0, EPS): {1, 4},
         (1, 'a'): {1, 2}, (1, 'b'): {1}, (2, 'b'): {3},              # ... ends in ab
         (4, 'a'): {4}, (4, 'b'): {4, 5}, (5, 'a'): {6}, (6, 'b'): {7},  # ... contains bab
         (7, 'a'): {7}, (7, 'b'): {7}}
nfa = NFA(delta, 0, {3, 7})
D = subset_construction(nfa, 'ab')
M = minimise(D)
print('NFA states: 8   DFA states:', len(D['states']), '  minimal DFA states:',
        len(M['states']))
words = [''.join(t) for n in range(11) for t in product('ab', repeat=n)]
ok = all(nfa.accepts(w) == dfa_accepts(M, w) == (w.endswith('ab') or 'bab' in w)
        for w in words)
print('NFA and minimal DFA agree with the definition on', len(words), 'strings:', ok)
```

The subset construction produced more DFA states than the minimal DFA needs: several reachable subsets behave identically for every future input and are merged by minimisation.

### Y1.3 Regular or not?

| Language | Regular? | Reason |
|---|---|---|
| (a) aⁿbᵐ | Yes | `a*b*` |
| (b) aⁿbⁿ, n ≤ 100 | Yes | A finite language is always regular (a DFA with about 200 states counts to 100) |
| (c) as many `01` as `10` | **Yes** | Each `01` or `10` is a switch between runs; switches alternate, so the counts differ by at most 1 and are equal exactly when the string starts and ends with the same symbol |
| (d) aᵖ, p prime | No | Pumping gives lengths p + k·|y| for all k; take k = p + 1: p(1 + |y|) is not prime |
| (e) binary multiples of 7 | Yes | 7-state DFA tracking the remainder (Chapter 1) |

```python run Checking the surprising one: count 01 versus 10
from itertools import product

def by_counting(w):
    pairs = [w[i:i + 2] for i in range(len(w) - 1)]
    return pairs.count('01') == pairs.count('10')

def by_dfa(w):                       # remembers only the first symbol and the latest symbol
    return len(w) == 0 or w[0] == w[-1]

words = [''.join(t) for n in range(15) for t in product('01', repeat=n)]
print('counting definition equals "first symbol == last symbol" on', len(words), 'strings:',
      all(by_counting(w) == by_dfa(w) for w in words))
```

The language looks as if it needs counting, but the counts can never drift apart by more than one, so a 5-state DFA (start, plus first-symbol × last-symbol) suffices. Intuition about "counting" is not a proof either way.

### Y1.4 A regex for 24-hour times

```python run Exhaustive test over every dd:dd string
import re

TIME = re.compile(r'([01]\d|2[0-3]):[0-5]\d')
candidates = [f'{h:02d}:{m:02d}' for h in range(100) for m in range(100)]
ok = all(bool(TIME.fullmatch(t)) == (int(t[:2]) < 24 and int(t[3:]) < 60)
        for t in candidates)
print('correct on all 10,000 dd:dd strings:', ok)
print({t: bool(TIME.fullmatch(t)) for t in ['00:00', '23:59', '24:00', '9:30', '12:60',
        '07:5']})
```

`fullmatch` matters: with `search`, `'123:45'` would be accepted because it contains `23:45`.

### Y1.5 A validator that hangs

A run of n digits can be split into one or more non-empty groups in 2ⁿ⁻¹ ways, and `(\d+)*` lets a backtracking engine try every split before concluding that the final `x` cannot match. With 22 digits that is about two million splits, each costing several steps. The language is simply "digits only", so `^\d*$` is equivalent and runs in linear time.

```python run The number of splits, and an equivalence proof on short strings
import re
from itertools import product

def splits(n):   # ways to split n digits into non-empty consecutive groups
    return 2 ** (n - 1) if n else 1

for n in [5, 10, 22]:
    print(f'{n:>2} digits then x: {splits(n):>9,} ways to split before failing')

bad, good = re.compile(r'(\d+)*'), re.compile(r'\d*')
words = [''.join(t) for n in range(11) for t in product('1x', repeat=n)]
print('equivalent on all', len(words), 'strings over {1, x} up to length 10:',
      all(bool(bad.fullmatch(w)) == bool(good.fullmatch(w)) for w in words))
```

The equivalence check is safe to run because the strings are short. The general rule: never nest a quantifier inside another quantifier over the same characters (`(a+)+`, `(a*)*`, `(\w+\s?)*`); for untrusted input, prefer a linear-time engine (RE2) or set a timeout.

## Part 2 solutions

### Y2.1 Equal numbers of a's and b's

`S → a S b S | b S a S | ε`: a non-empty balanced string starts with `a` or `b`; split it at the first point where the counts balance again.

```python run The grammar generates exactly the balanced strings up to length 8
from itertools import product
from collections import deque

G = {'S': [('a', 'S', 'b', 'S'), ('b', 'S', 'a', 'S'), ()]}
MAX = 8
generated, todo, seen = set(), deque([('S',)]), set()
while todo:
    form = todo.popleft()
    if form in seen or sum(s != 'S' for s in form) > MAX:
        continue
    seen.add(form)
    i = next((k for k, s in enumerate(form) if s == 'S'), None)
    if i is None:
        generated.add(''.join(form)); continue
    for rhs in G['S']:
        todo.append(form[:i] + rhs + form[i + 1:])

expected = {''.join(t) for n in range(0, MAX + 1, 2) for t in product('ab', repeat=n)
            if t.count('a') == t.count('b')}
print('strings generated:', len(generated), ' expected:', len(expected),
      ' identical sets:', generated == expected)
```

### Y2.2 An ambiguous bracket grammar

With ε in the grammar, `S → S S | ε` already gives **infinitely** many parse trees (S ⇒ SS ⇒ S ε ⇒ ...). Even without ε, `S → S S | ( S ) | ( )` is ambiguous: concatenation can be grouped in many ways. The unambiguous grammar `S → ( S ) S | ε` decides the split uniquely: the first `(` and its matching `)`.

```python run Parse trees: concatenation grammar versus ( S ) S
from functools import lru_cache

def count_concat(w):                 # S -> S S | ( S ) | ( )      (non-empty strings)
    @lru_cache(None)
    def S(i, j):
        if j - i < 2:
            return 0
        n = 1 if (j - i == 2 and w[i] == '(' and w[j - 1] == ')') else 0
        if w[i] == '(' and w[j - 1] == ')':
            n += S(i + 1, j - 1)
        return n + sum(S(i, k) * S(k, j) for k in range(i + 2, j - 1))
    return S(0, len(w))

def count_unambiguous(w):            # S -> ( S ) S | ε
    @lru_cache(None)
    def S(i, j):
        if i == j:
            return 1
        if w[i] != '(':
            return 0
        return sum(S(i + 1, k) * S(k + 1, j) for k in range(i + 1, j) if w[k] == ')')
    return S(0, len(w))

for w in ['()()()', '(())()', '()()()()', '(()())()()']:
    print(f'{w:<11} S -> SS|(S)|(): {count_concat(w):>2} trees    S -> (S)S|ε: '
            f'{count_unambiguous(w)}')
```

Three bracket pairs side by side have 2 trees under the concatenation grammar, four have 5 (Catalan numbers again); the `( S ) S` grammar always gives exactly one, which is why it is the standard choice.

### Y2.3 The dangling else in an LL(1) table

```python run FIRST, FOLLOW and the conflicting cell
G = {'S': [['if', 'E', 'then', 'S', "S'"], ['other']],
     "S'": [['else', 'S'], []],
     'E': [['b']]}
NT = set(G)

def first_seq(seq, F):
    out = set()
    for s in seq:
        f = F[s] if s in NT else {s}
        out |= f - {'ε'}
        if 'ε' not in f:
            return out
    return out | {'ε'}

FIRST = {A: set() for A in NT}
FOLLOW = {A: set() for A in NT}; FOLLOW['S'].add('$')
for _ in range(10):                                      # iterate to a fixed point
    for A, prods in G.items():
        for rhs in prods:
            FIRST[A] |= first_seq(rhs, FIRST)
            for i, B in enumerate(rhs):
                if B in NT:
                    f = first_seq(rhs[i + 1:], FIRST)
                    FOLLOW[B] |= (f - {'ε'}) | (FOLLOW[A] if 'ε' in f else set())

table = {}
for A, prods in G.items():
    for rhs in prods:
        f = first_seq(rhs, FIRST)
        for t in (f - {'ε'}) | (FOLLOW[A] if 'ε' in f else set()):
            table.setdefault((A, t), []).append(' '.join(rhs) or 'ε')
for A in ['S', "S'", 'E']:
    print(f'{A:<3} FIRST {sorted(FIRST[A])}   FOLLOW {sorted(FOLLOW[A])}')
print('conflicts:', {k: v for k, v in table.items() if len(v) > 1})
```

`else` is in FOLLOW(S′) because an inner `if` (ending in S′) can be followed by the `else` of an outer `if`. So on seeing `else`, the parser cannot tell whether to attach it to the inner statement (`S′ → else S`) or end the inner statement (`S′ → ε`). Every mainstream language resolves it the same way: **the `else` belongs to the nearest `if`**, implemented by always choosing `S′ → else S` (in LR parsers, by preferring shift over reduce). Languages such as Python, Go and Rust avoid the issue with indentation or mandatory braces.

### Y2.4 Three kinds of brackets

```python run A deterministic PDA for ()[]{}, checked against pair removal
from itertools import product

PAIRS = {')': '(', ']': '[', '}': '{'}

def dpda(w):
    stack = []
    for c in w:
        if c in '([{':
            stack.append(c)
        elif not stack or stack.pop() != PAIRS[c]:
            return False
    return not stack

def by_removal(w):                   # reference: delete adjacent matching pairs until stuck
    prev = None
    while prev != w:
        prev, w = w, w.replace('()', '').replace('[]', '').replace('{}', '')
    return w == ''

words = [''.join(t) for n in range(7) for t in product('()[]{}', repeat=n)]
print('agree on all', len(words), 'strings up to length 6:',
      all(dpda(w) == by_removal(w) for w in words))
print({w: dpda(w) for w in ['([]{})', '([)]', '{[()]}', '((']})
```

### Y2.5 A right-associative operator

In precedence climbing, a left-associative operator parses its right operand with minimum precedence `prec + 1`, so an operator of the same level stops the right side; a right-associative one uses `prec`, so the right side swallows the rest of the chain.

```python run Exponentiation that binds tighter than * and associates to the right
import re

PREC = {'+': (1, 'L'), '-': (1, 'L'), '*': (2, 'L'), '/': (2, 'L'), '^': (3, 'R')}

def evaluate(text):
    toks = re.findall(r'\d+|[-+*/^()]', text)
    pos = 0
    def primary():
        nonlocal pos
        tok = toks[pos]; pos += 1
        if tok == '(':
            v = expr(1); pos += 1                        # skip ')'
            return v
        return int(tok)
    def expr(min_prec):
        nonlocal pos
        left = primary()
        while pos < len(toks) and toks[pos] in PREC and PREC[toks[pos]][0] >= min_prec:
            op = toks[pos]; pos += 1
            prec, assoc = PREC[op]
            right = expr(prec + 1 if assoc == 'L' else prec)
            left = {'+': left + right, '-': left - right, '*': left * right,
                    '/': left // right, '^': left ** right}[op]
        return left
    return expr(1)

for text in ['2 ^ 3 ^ 2', '(2 ^ 3) ^ 2', '2 * 3 ^ 2', '10 - 4 - 3', '2 ^ 2 * 3']:
    print(f'{text:<12} = {evaluate(text)}')
```

`2 ^ 3 ^ 2` is 2⁹ = 512 (right-associative, as in mathematics), while `10 - 4 - 3` stays left-associative (3), and `^` binds tighter than `*` in both directions.
