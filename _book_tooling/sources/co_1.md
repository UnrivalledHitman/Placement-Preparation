# Chapter 3: Regular Expressions and Their Limits
%From regular expressions to NFAs, what finite automata cannot do, and why some regex engines take exponential time

## 3.1 Regular expressions are automata in disguise

A regular expression is built from symbols, ε, union (`|`), concatenation and Kleene star (`*`), with `+` and `?` as shorthands. **Kleene's theorem**: regular expressions, NFAs and DFAs describe exactly the same languages. **Thompson's construction** turns a regular expression into an ε-NFA with a small fragment per operator, so the NFA has O(length of the regex) states.

```python run Thompson's construction, cross-checked against Python's re module
import itertools, random, re
from automata import NFA, EPS

def parse(rx):
    """Recursive descent:
    alt := cat ('|' cat)*    cat := rep*    rep := atom ('*' | '+' | '?')*"""
    pos = 0
    def peek(): return rx[pos] if pos < len(rx) else None
    def eat():
        nonlocal pos; pos += 1; return rx[pos - 1]
    def alt():
        node = cat()
        while peek() == '|':
            eat(); node = ('|', node, cat())
        return node
    def cat():
        node = ('eps',)
        while peek() not in (None, '|', ')'):
            node = ('.', node, rep())
        return node
    def rep():
        node = atom()
        while peek() in ('*', '+', '?'):
            node = (eat(), node)
        return node
    def atom():
        if peek() == '(':
            eat(); node = alt(); eat(); return node
        return ('sym', eat())
    return alt()

def thompson(tree):
    delta, counter = {}, itertools.count()
    def edge(p, a, q): delta.setdefault((p, a), set()).add(q)
    def build(t):                                     # returns (start, end) of a fragment
        s, e = next(counter), next(counter)
        kind = t[0]
        if kind == 'eps':
            edge(s, EPS, e)
        elif kind == 'sym':
            edge(s, t[1], e)
        elif kind == '.':
            a, b = build(t[1]), build(t[2])
            edge(s, EPS, a[0]); edge(a[1], EPS, b[0]); edge(b[1], EPS, e)
        elif kind == '|':
            for sub in t[1:]:
                f = build(sub); edge(s, EPS, f[0]); edge(f[1], EPS, e)
        else:                                         # '*', '+', '?'
            f = build(t[1])
            edge(s, EPS, f[0]); edge(f[1], EPS, e)
            if kind in '*?': edge(s, EPS, e)
            if kind in '*+': edge(f[1], EPS, f[0])
        return s, e
    start, end = build(tree)
    return NFA(delta, start, {end}), next(counter)

rnd = random.Random(1)
for rx in ['(a|b)*abb', 'a(ba)*b?', '(ab|ba)+', '((a|b)(a|b))*']:
    nfa, n_states = thompson(parse(rx))
    words = [''.join(rnd.choice('ab') for _ in range(rnd.randint(0, 10)))
            for _ in range(3000)]
    agree = all(nfa.accepts(w) == bool(re.fullmatch(rx, w)) for w in words)
    print(f'{rx:<15} NFA states {n_states:>3}   agrees with re on 3000 strings: {agree}')
```

The NFA sizes grow linearly with the expression, and the matcher agrees with Python's `re` on thousands of random strings. Simulating this NFA by tracking the set of current states (Chapter 2) matches a string of length n in O(n × m) time for an m-state NFA, **never exponential**.

## 3.2 What finite automata cannot do

A DFA has k states and nothing else, so it cannot count without bound. The **pumping lemma** makes this precise: for a regular language L there is a p such that any string in L of length at least p can be split as xyz, with |xy| ≤ p and |y| ≥ 1, so that xyⁱz is in L for every i ≥ 0. For L = {aⁿbⁿ}: take aᵖbᵖ; y lies inside the a's, so pumping it changes the number of a's but not b's, giving a string outside L. Hence {aⁿbⁿ} is **not regular**, and neither are balanced parentheses, palindromes or "equal numbers of 0s and 1s".

The theorem predicts something checkable: **every** DFA, however clever, misclassifies some string of the form aⁿbⁿ or aⁿbᵐ with small n and m.

```python run Every DFA gets some aⁿbⁿ question wrong
import random
from itertools import product

def counting_dfa(limit):
    """The best a DFA can do: count a's up to `limit`, then match that many b's."""
    delta, dead = {}, 'dead'
    for i in range(limit + 1):
        delta[(('a', i), 'a')] = ('a', i + 1) if i < limit else dead
        delta[(('a', i), 'b')] = ('b', i - 1) if i > 0 else dead
        delta[(('b', i), 'b')] = ('b', i - 1) if i > 0 else dead
        delta[(('b', i), 'a')] = dead
    delta[(dead, 'a')] = delta[(dead, 'b')] = dead
    states = {q for (q, _) in delta} | set(delta.values())
    accept = {('a', 0), ('b', 0)}
    return states, ('a', 0), accept, lambda q, c: delta.get((q, c), dead)

def counterexample(start, accept, step, max_n):
    for n in range(max_n + 1):
        for m in range(max_n + 1):
            q = start
            for c in 'a' * n + 'b' * m:
                q = step(q, c)
            if (q in accept) != (n == m):
                return n, m
    return None

for limit in [3, 10, 25]:
    states, start, accept, step = counting_dfa(limit)
    print(f'counting DFA with {len(states)} states: wrong on a^n b^m with (n, m) =',
          counterexample(start, accept, step, len(states)))

rnd = random.Random(4)
wrong = 0
for _ in range(2000):                                   # random DFAs with 6 states
    k = 6
    table = {(q, c): rnd.randrange(k) for q, c in product(range(k), 'ab')}
    acc = {q for q in range(k) if rnd.random() < 0.5}
    if counterexample(0, acc, lambda q, c: table[(q, c)], k):
        wrong += 1
print('random 6-state DFAs with a counterexample of size <= 6:', wrong, 'of 2000')
```

The counting DFA is correct up to its limit and fails just beyond it, and every one of 2,000 random six-state DFAs fails within n, m ≤ 6, as the pigeonhole argument behind the lemma guarantees (after k a's some state repeats, so the DFA cannot tell aⁱ from aʲ for some i ≠ j). To recognise aⁿbⁿ you need a stack (Chapter 5).

| Closure property | Regular languages |
|---|---|
| Union, intersection, complement, difference | Closed (product construction, swap accepting states) |
| Concatenation, star, reversal | Closed |
| Homomorphism, inverse homomorphism | Closed |

| Decision problem for regular languages | Decidable? |
|---|---|
| Is w in L? Is L empty? Is L infinite? | Yes, by graph search on the DFA |
| Is L₁ = L₂? | Yes: minimise both and compare, or check that the symmetric difference is empty |

## 3.3 Why a regex can hang a server

Many practical engines (Java, Python, JavaScript, PCRE) do not simulate the NFA; they **backtrack**, trying one choice and undoing it on failure. That allows features beyond regular languages (backreferences such as `(a+)\1`), but some patterns then take exponential time on inputs that fail to match. The pattern `(a+)+b` against a string of a's with no b is the classic case: the engine tries every way to split the a's between the inner and outer `+`.

```python run Steps taken by a backtracking matcher versus NFA simulation on (a+)+b
def backtracking_steps(n):
    """Count the attempts a backtracking engine makes for (a+)+b on 'a' * n."""
    text, steps = 'a' * n, 0
    def outer(i):                         # (a+)+ starting at i, then b
        nonlocal steps
        # inner a+ greedily takes a's, then gives them back
        for j in range(len(text), i, -1):
            steps += 1
            if all(c == 'a' for c in text[i:j]):
                if (j < len(text) and text[j] == 'b') or outer(j):
                    return True
        return False
    outer(0)
    return steps

def nfa_steps(n):
    return n + 1                          # one pass, a bounded set of states per character

print(' n   backtracking steps   NFA-simulation steps')
for n in [5, 10, 15, 20]:
    print(f'{n:>2} {backtracking_steps(n):>20,} {nfa_steps(n):>22}')
```

Each extra character doubles the backtracking work: about a million steps at 20 characters and a billion at 30, while the NFA simulation does 31. This is **ReDoS** (regular-expression denial of service): a request with a crafted string pins a CPU core. Defences: avoid nested quantifiers over the same characters, use possessive quantifiers or atomic groups where supported, set match timeouts, or use engines that guarantee linear time (RE2, Rust's `regex`, Go's `regexp`), which give up backreferences in exchange.

## 3.4 Practical lessons

- Regular expressions, NFAs and DFAs are equivalent; Thompson's construction gives a linear-size NFA.
- Finite automata cannot count without bound: {aⁿbⁿ}, balanced brackets and palindromes are not regular.
- Backtracking regex engines can take exponential time; prefer linear-time engines or safe patterns for untrusted input.
- Regular languages are closed under all the usual operations and their equivalence is decidable.

# Chapter 4: Context-Free Grammars
%Productions and derivations, parse trees, ambiguity and how grammars encode operator precedence, and CYK parsing

## 4.1 Grammars and derivations

A **context-free grammar** (CFG) has variables (non-terminals), terminals, productions of the form A → α, and a start variable. A string is in the language if it can be **derived** from the start variable by repeatedly replacing a variable with the right side of one of its productions.

| Language | Grammar |
|---|---|
| {aⁿbⁿ : n ≥ 0} | S → a S b \| ε |
| Balanced parentheses | S → ( S ) S \| ε |
| Palindromes over {a, b} | S → a S a \| b S b \| a \| b \| ε |
| Arithmetic expressions | E → E + T \| T;  T → T * F \| F;  F → ( E ) \| n |

```python run The first strings found by breadth-first derivation
from collections import deque

def generate(grammar, start, limit, max_len=10):
    seen, out, todo = set(), [], deque([(start,)])
    while todo and len(out) < limit:
        form = todo.popleft()
        i = next((k for k, s in enumerate(form) if s in grammar), None)
        if i is None:                                   # only terminals left
            w = ''.join(form)
            if w not in seen:
                seen.add(w); out.append(w or 'ε')
            continue
        for rhs in grammar[form[i]]:
            new = form[:i] + tuple(rhs) + form[i + 1:]
            if sum(s not in grammar for s in new) <= max_len:
                todo.append(new)
    return out

print('a^n b^n:  ', generate({'S': [('a', 'S', 'b'), ()]}, 'S', 5))
print('balanced: ', generate({'S': [('(', 'S', ')', 'S'), ()]}, 'S', 9))
print('palindromes:', generate({'S': [('a', 'S', 'a'), ('b', 'S', 'b'), ('a',), ('b',),
        ()]}, 'S', 9))
```

## 4.2 Ambiguity and precedence

A grammar is **ambiguous** if some string has two different parse trees. Ambiguity matters because the tree determines meaning: in `2 + 3 * 4` one tree means 14 and the other 20.

```python run Counting parse trees: an ambiguous grammar versus a layered one
from functools import lru_cache

def count_ambiguous(tokens):
    """E -> E + E | E * E | n : number of parse trees for the whole token list."""
    @lru_cache(None)
    def E(i, j):
        if j - i == 1:
            return 1 if tokens[i] == 'n' else 0
        return sum(E(i, k) * E(k + 1, j) for k in range(i + 1, j - 1) if tokens[k] in '+*')
    return E(0, len(tokens))

def count_layered(tokens):
    """E -> E + T | T ; T -> T * F | F ; F -> n : precedence and associativity built in."""
    @lru_cache(None)
    def E(i, j):
        return T(i, j) + sum(E(i, k) * T(k + 1, j) for k in range(i + 1, j)
                if tokens[k] == '+')
    @lru_cache(None)
    def T(i, j):
        return F(i, j) + sum(T(i, k) * F(k + 1, j) for k in range(i + 1, j)
                if tokens[k] == '*')
    @lru_cache(None)
    def F(i, j):
        return 1 if j - i == 1 and tokens[i] == 'n' else 0
    return E(0, len(tokens))

for expr in ['n+n*n', 'n+n+n', 'n+n*n+n*n', 'n+n+n+n+n+n']:
    t = tuple(expr)
    print(f'{expr:<13} ambiguous grammar: {count_ambiguous(t):>3} trees   layered grammar: '
            f'{count_layered(t)}')
```

The ambiguous grammar gives 2 trees for `n+n*n` and 42 for six operands (the Catalan numbers); the layered grammar gives exactly one, because each precedence level has its own variable (`*` binds tighter, so it sits lower in the tree) and left recursion (E → E + T) makes `+` **left-associative**. Parser generators instead accept the ambiguous grammar plus precedence declarations (`%left '+'`), which resolve the same choices.

> TRAP: The **dangling else**, `if a then if b then s1 else s2`, is ambiguous in naive grammars: which `if` owns the `else`? Languages resolve it by rule (the nearest `if`), and grammars encode that with separate "matched" and "unmatched" statement variables, or the parser prefers shifting the `else`.

## 4.3 Chomsky normal form and CYK

Any CFG (without ε, apart from possibly the start symbol) can be converted to **Chomsky normal form**, where every production is A → BC or A → a. The **CYK** algorithm then decides membership for any CFG in O(n³ · |G|) time by dynamic programming over substrings: table[i][j] holds the variables that derive the substring from i to j.

```python run CYK for balanced parentheses in Chomsky normal form
from itertools import product

# S -> ( S ) S | ε in CNF (non-empty strings):
#   S -> SS | LR | LA ;  A -> SR ;  L -> ( ;  R -> )
binary = {('S', 'S'): {'S'}, ('L', 'R'): {'S'}, ('L', 'A'): {'S'}, ('S', 'R'): {'A'}}
unit = {'(': {'L'}, ')': {'R'}}

def cyk(w):
    n = len(w)
    if n == 0:
        return True
    table = [[set() for _ in range(n)] for _ in range(n)]
    for i, c in enumerate(w):
        table[i][i] = set(unit.get(c, ()))
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            for k in range(i, j):
                for B, C in product(table[i][k], table[k + 1][j]):
                    table[i][j] |= binary.get((B, C), set())
    return 'S' in table[0][n - 1]

def balanced(w):
    depth = 0
    for c in w:
        depth += 1 if c == '(' else -1
        if depth < 0:
            return False
    return depth == 0

words = [''.join(p) for n in range(11) for p in product('()', repeat=n)]
print('CYK agrees with a depth counter on all', len(words), 'strings up to length 10:',
      all(cyk(w) == balanced(w) for w in words))
print({w: cyk(w) for w in ['(())()', '(()', ')(', '((()))']})
```

CYK is too slow for compilers (they use linear-time LL or LR parsers for restricted grammars; Chapter 5), but it works for **any** CFG and is used in natural-language parsing and as the textbook proof that CFG membership is decidable in polynomial time.

## 4.4 Practical lessons

- CFGs generate languages that need nesting: brackets, expressions, programming-language syntax.
- Ambiguity gives several parse trees and several meanings; layered grammars encode precedence and associativity.
- Chomsky normal form plus CYK decides membership for any CFG in cubic time.
- Real compilers use restricted grammar classes (LL, LR) that parse in linear time.
