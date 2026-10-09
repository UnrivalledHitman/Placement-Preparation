# Chapter 5: Parsing and Pushdown Automata
%FIRST and FOLLOW sets, LL(1) tables, left recursion, LR parsing in outline, and automata with a stack

## 5.1 Top-down parsing and LL(1)

A **top-down** parser starts from the start symbol and predicts which production to use by looking at the next input token. A grammar is **LL(1)** if one token of lookahead always suffices. Two sets decide this:

- **FIRST(α)**: the terminals that can begin a string derived from α (plus ε if α can derive the empty string).
- **FOLLOW(A)**: the terminals that can appear immediately after A in some derivation (plus `$` for end of input).

The LL(1) table entry M[A, t] is the production A → α if t ∈ FIRST(α), or if α can vanish and t ∈ FOLLOW(A). If any entry gets two productions, the grammar is not LL(1). The expression grammar from Chapter 4 is left-recursive (E → E + T), which no top-down parser can handle, so it is first rewritten:

```python run FIRST, FOLLOW, the LL(1) table and a table-driven parse
G = {                       # left recursion removed: E -> T E' ; E' -> + T E' | ε ; ...
    'E':  [['T', "E'"]],
    "E'": [['+', 'T', "E'"], []],
    'T':  [['F', "T'"]],
    "T'": [['*', 'F', "T'"], []],
    'F':  [['(', 'E', ')'], ['n']],
}
NT = set(G)

def first_of(seq, FIRST):
    out = set()
    for sym in seq:
        f = FIRST[sym] if sym in NT else {sym}
        out |= f - {'ε'}
        if 'ε' not in f:
            return out
    return out | {'ε'}

FIRST = {A: set() for A in NT}
changed = True
while changed:
    changed = False
    for A, prods in G.items():
        for rhs in prods:
            f = first_of(rhs, FIRST)
            if not f <= FIRST[A]:
                FIRST[A] |= f; changed = True

FOLLOW = {A: set() for A in NT}; FOLLOW['E'].add('$')
changed = True
while changed:
    changed = False
    for A, prods in G.items():
        for rhs in prods:
            for i, B in enumerate(rhs):
                if B in NT:
                    f = first_of(rhs[i + 1:], FIRST)
                    new = (f - {'ε'}) | (FOLLOW[A] if 'ε' in f else set())
                    if not new <= FOLLOW[B]:
                        FOLLOW[B] |= new; changed = True

table, conflicts = {}, 0
for A, prods in G.items():
    for rhs in prods:
        f = first_of(rhs, FIRST)
        for t in (f - {'ε'}) | (FOLLOW[A] if 'ε' in f else set()):
            conflicts += (A, t) in table
            table[(A, t)] = rhs

for A in ['E', "E'", 'T', "T'", 'F']:
    print(f'{A:<3} FIRST {sorted(FIRST[A])!s:<16} FOLLOW {sorted(FOLLOW[A])}')
print('LL(1) conflicts:', conflicts)

def parse(tokens):
    stack, i, steps = ['$', 'E'], 0, 0
    tokens = tokens + ['$']
    while stack:
        top = stack.pop(); steps += 1
        if top not in NT:
            if top != tokens[i]:
                return f'error at token {i}: expected {top!r}, found {tokens[i]!r}'
            i += 1; continue
        rhs = table.get((top, tokens[i]))
        if rhs is None:
            return f'error at token {i}: no rule for {top} on {tokens[i]!r}'
        stack.extend(reversed(rhs))
    return f'accepted in {steps} steps'

for text in ['n+n*n', '(n+n)*n', 'n+*n', '(n']:
    print(f'{text:<8} {parse(list(text))}')
```

No table cell has two productions, so the grammar is LL(1) and the parser never backtracks. Its errors are precise ("no rule for T on '*'": after `+` a term must start) because the table knows exactly which tokens may come next, which is why hand-written recursive-descent parsers (Chapter 9), which are the same idea as functions, are popular in production compilers (GCC, Clang, Go, Rust's rustc).

| Problem | Fix for top-down parsing |
|---|---|
| Left recursion A → A α \| β (infinite recursion) | Rewrite as A → β A′, A′ → α A′ \| ε, or use a loop in recursive descent |
| Common prefixes A → α β₁ \| α β₂ | Left-factor: A → α A′, A′ → β₁ \| β₂ |
| Ambiguity | Rewrite the grammar or add precedence rules |

## 5.2 Bottom-up parsing in outline

**LR parsers** read tokens left to right and build the tree bottom-up: they **shift** tokens onto a stack and **reduce** the top of the stack to a non-terminal when it matches a production's right side, guided by a table built from the grammar's items (LR(0), SLR, LALR(1), LR(1)). They accept a larger class of grammars than LL(1), including left-recursive ones, and are what parser generators such as yacc and Bison produce (ANTLR, by contrast, generates LL(*) top-down parsers).

```text
Shift-reduce trace for n + n * n with E -> E + T | T, T -> T * F | F, F -> n
stack           input        action
                n + n * n $  shift n
n               + n * n $    reduce F -> n, T -> F, E -> T
E               + n * n $    shift +, shift n
E + n           * n $        reduce F -> n, T -> F       (not E -> E + T: '*' binds tighter)
E + T           * n $        shift *, shift n
E + T * n       $            reduce F -> n, T -> T * F, E -> E + T
E               $            accept
```

| | LL (top-down) | LR (bottom-up) |
|---|---|---|
| Builds the tree | From the root | From the leaves |
| Grammars | No left recursion, must be left-factored | Left recursion fine; larger class |
| Written by hand? | Yes (recursive descent) | Rarely; generated from the grammar |
| Error messages | Easy to make precise | Harder; needs error productions |

## 5.3 Pushdown automata

A **pushdown automaton** (PDA) is a finite automaton plus a stack. It recognises exactly the context-free languages. A deterministic PDA handles {aⁿbⁿ} by pushing for each `a` and popping for each `b`. Even-length palindromes {wwᴿ} need **nondeterminism**: the machine must guess where the middle is. Unlike finite automata, deterministic PDAs are strictly weaker than nondeterministic ones.

```python run A nondeterministic PDA for even palindromes, simulated by exploring configurations
from itertools import product

def npda_even_palindrome(w):
    """Phase 'push': push symbols; at any point guess the middle and switch to 'pop'."""
    configs = {('push', 0, ())}                # (phase, position, stack as a tuple)
    explored = 0
    while configs:
        nxt = set()
        for phase, i, stack in configs:
            explored += 1
            if phase == 'pop' and i == len(w) and not stack:
                return True, explored
            if phase == 'push':
                nxt.add(('pop', i, stack))     # ε-move: guess that the middle is here
                if i < len(w):
                    nxt.add(('push', i + 1, stack + (w[i],)))
            elif i < len(w) and stack and stack[-1] == w[i]:
                nxt.add(('pop', i + 1, stack[:-1]))
        configs = nxt
    return False, explored

for w in ['abba', 'abab', 'aabbaa', 'abbaab', '']:
    ok, n = npda_even_palindrome(w)
    print(f'{w!r:<9} accepted: {ok!s:<5} configurations explored: {n}')
words = [''.join(p) for n in range(11) for p in product('ab', repeat=n)]
print('agrees with w == reversed(w) and even length for all', len(words), 'strings:',
      all(npda_even_palindrome(w)[0] == (w == w[::-1] and len(w) % 2 == 0) for w in words))
```

| Closure property | Context-free languages |
|---|---|
| Union, concatenation, star | Closed |
| Intersection, complement | **Not** closed: {aⁿbⁿcᵐ} ∩ {aᵐbⁿcⁿ} = {aⁿbⁿcⁿ}, which is not context-free |
| Intersection with a regular language | Closed |

A pumping lemma for CFLs (pump two substrings together) shows {aⁿbⁿcⁿ} and {ww} are not context-free: a single stack cannot match three counts or copy a string in order. That needs a Turing machine.

## 5.4 Practical lessons

- FIRST and FOLLOW sets build an LL(1) table; conflicts mean the grammar needs rewriting.
- Remove left recursion and left-factor for top-down parsing; LR parsers accept left recursion.
- PDAs = context-free languages; nondeterministic PDAs are strictly stronger than deterministic ones.
- Context-free languages are not closed under intersection or complement.

# Chapter 6: Turing Machines
%The most general model of computation: a finite control, an unbounded tape, and a head that reads, writes and moves

## 6.1 The machine

A **Turing machine** has a finite set of states, a tape of cells (unbounded in one or both directions) and a head. Each step reads the symbol under the head and, from the transition function δ(state, symbol) = (new state, symbol to write, move L or R), writes, moves and changes state. It **accepts** by entering an accept state and **rejects** by entering a reject state or getting stuck; it may also **run forever**.

```python run A Turing-machine simulator: binary increment and {aⁿbⁿcⁿ}
def run_tm(delta, tape, start='q0', accept='acc', blank='_', max_steps=100_000):
    tape, head, state, steps = dict(enumerate(tape)), 0, start, 0
    while state not in (accept, 'rej') and steps < max_steps:
        sym = tape.get(head, blank)
        if (state, sym) not in delta:
            state = 'rej'; break
        state, write, move = delta[(state, sym)]
        tape[head] = write
        head += 1 if move == 'R' else -1
        steps += 1
    cells = ''.join(tape.get(i, blank) for i in range(min(tape), max(tape)
            + 1)).strip(blank)
    return state == accept, cells, steps

increment = {                                 # go right to the end, then add 1 with carry
    ('q0', '0'): ('q0', '0', 'R'), ('q0', '1'): ('q0', '1', 'R'), ('q0', '_'): ('carry',
            '_', 'L'),
    ('carry', '1'): ('carry', '0', 'L'), ('carry', '0'): ('acc', '1', 'L'),
    ('carry', '_'): ('acc', '1', 'L'),
}
for x in ['1011', '111', '0']:
    ok, out, steps = run_tm(increment, x)
    print(f'increment {x:>4} -> {out:>5}  ({steps} steps)')

# a^n b^n c^n: repeatedly mark one a (X), one b (Y), one c (Z); accept when only marks remain
abc = {
    ('q0', 'a'): ('q1', 'X', 'R'), ('q0', 'Y'): ('q4', 'Y', 'R'), ('q0', '_'): ('acc', '_',
            'R'),
    ('q1', 'a'): ('q1', 'a', 'R'), ('q1', 'Y'): ('q1', 'Y', 'R'), ('q1', 'b'): ('q2', 'Y',
            'R'),
    ('q2', 'b'): ('q2', 'b', 'R'), ('q2', 'Z'): ('q2', 'Z', 'R'), ('q2', 'c'): ('q3', 'Z',
            'L'),
    ('q3', 'a'): ('q3', 'a', 'L'), ('q3', 'b'): ('q3', 'b', 'L'), ('q3', 'Y'): ('q3', 'Y',
            'L'),
    ('q3', 'Z'): ('q3', 'Z', 'L'), ('q3', 'X'): ('q0', 'X', 'R'),
    ('q4', 'Y'): ('q4', 'Y', 'R'), ('q4', 'Z'): ('q4', 'Z', 'R'), ('q4', '_'): ('acc', '_',
            'R'),
}
for w in ['abc', 'aabbcc', 'aabbc', 'abcabc', 'aaabbbccc']:
    ok, out, steps = run_tm(abc, w)
    print(f'{w:<10} accepted: {ok!s:<5} steps: {steps:>3}   final tape: {out}')
import itertools
words = [''.join(p) for n in range(10) for p in itertools.product('abc', repeat=n)]
def in_lang(w):
    n = len(w) // 3
    return w == 'a' * n + 'b' * n + 'c' * n
print('agrees with the definition on all', len(words), 'strings up to length 9:',
      all(run_tm(abc, w)[0] == in_lang(w) for w in words))
```

The {aⁿbⁿcⁿ} machine does what no PDA can: it crosses off one symbol of each kind per pass, using the tape as rewritable memory. Its running time is O(n²) (n passes over the input), and the step counts grow accordingly.

## 6.2 Why Turing machines matter

| Fact | Meaning |
|---|---|
| **Church–Turing thesis** | Anything computable by an effective procedure is computable by a Turing machine. Not a theorem, but every proposed model (λ-calculus, register machines, modern computers with unbounded memory) has turned out equivalent |
| Robustness | Multiple tapes, two-way tapes, nondeterminism: none adds power (they may change running time, polynomially for multi-tape) |
| **Universal Turing machine** | One machine that takes another machine's description plus its input and simulates it: the theoretical stored-program computer, and the basis for interpreters |
| Turing-complete | A system that can simulate any Turing machine (given unbounded memory): every mainstream programming language, but also SQL with recursive CTEs, C++ templates and Conway's Game of Life |

## 6.3 Practical lessons

- A Turing machine is a finite control plus unbounded rewritable memory; it can loop forever.
- It recognises languages beyond context-free, such as {aⁿbⁿcⁿ} and {ww}.
- The Church–Turing thesis equates "algorithm" with "Turing machine"; all general-purpose languages are equivalent in power.
- A universal machine simulates any other machine from its description, which is what interpreters do.

# Chapter 7: Decidability and Complexity
%Problems no program can solve, how reductions prove it, and the classes P, NP and NP-complete

## 7.1 The halting problem

A language is **decidable** if some Turing machine always halts and answers correctly, and **recognisable** (recursively enumerable) if some machine halts and accepts exactly its members (it may run forever on non-members).

**Theorem (Turing, 1936):** no program can decide, for every program P and input x, whether P halts on x.

*Proof by contradiction.* Suppose `halts(P, x)` always answers correctly. Build:

```text
def paradox(P):
    if halts(P, P):        # would P halt when given its own source as input?
        while True: pass   # then loop forever
    else:
        return             # otherwise halt
```

Now ask whether `paradox(paradox)` halts. If `halts` says yes, `paradox` loops forever; if it says no, `paradox` halts. Either way `halts` was wrong, so it cannot exist. This is a **diagonal argument**, the same idea Cantor used to show the real numbers are uncountable.

The halting problem is **recognisable** (run P and accept if it halts) but not decidable; its complement ("P runs forever on x") is not even recognisable.

## 7.2 Reductions and Rice's theorem

To show a problem B is undecidable, **reduce** a known undecidable problem A to it: show that a decider for B could be used to build a decider for A. For example, "does program P print `hello`?" is undecidable: given (P, x), build P′ that runs P on x (suppressing its output) and then prints `hello`; P′ prints `hello` exactly when P halts on x.

**Rice's theorem** generalises this: **every non-trivial property of the behaviour of programs** (of the function they compute, not their text) is undecidable. Does this program ever divide by zero? Are these two functions equivalent? Does it leak this variable? All undecidable in general.

That is why static analysers, type checkers and linters are **approximations**: they are either *sound* (never miss a real bug but report false alarms) or *complete* (no false alarms but miss some bugs), and cannot be both and always terminate. Type systems choose soundness and reject some correct programs; bug-finding tools often choose fewer false alarms.

| Problem | Status |
|---|---|
| DFA accepts w? DFA language empty? Two DFAs equivalent? | Decidable |
| CFG generates w? CFG language empty? | Decidable |
| Two CFGs generate the same language? CFG ambiguous? | Undecidable |
| Turing machine halts on w? Accepts any string? | Undecidable (halting is recognisable) |
| Post correspondence problem; Hilbert's tenth problem (integer solutions of polynomial equations) | Undecidable |

## 7.3 P, NP and NP-completeness

For decidable problems, the question becomes **efficiency**.

| Class | Definition | Examples |
|---|---|---|
| **P** | Decidable in polynomial time by a deterministic machine | Shortest paths, sorting, matching, linear programming, primality |
| **NP** | A proposed solution (certificate) can be **verified** in polynomial time | SAT, subset sum, graph colouring, travelling salesman (decision version), Sudoku |
| **NP-hard** | Every NP problem reduces to it in polynomial time | Halting problem (NP-hard but not in NP), TSP optimisation |
| **NP-complete** | In NP and NP-hard | SAT (Cook–Levin), 3-SAT, clique, vertex cover, Hamiltonian cycle, subset sum, 3-colouring |

Whether P = NP is the most famous open problem in computer science. If any NP-complete problem had a polynomial algorithm, all of NP would. The gap between **finding** and **checking** is easy to see:

```python run Subset sum: checking a certificate versus searching for one
import itertools, random

rnd = random.Random(7)
def instance(n):
    nums = [rnd.randrange(10**6, 10**7) for _ in range(n)]
    target = sum(rnd.sample(nums, n // 2))             # a solution exists by construction
    return nums, target

def verify(nums, target, chosen):                       # polynomial: one pass
    return sum(nums[i] for i in chosen) == target

def search(nums, target):                               # exponential: try subsets
    tried = 0
    for r in range(len(nums) + 1):
        for subset in itertools.combinations(range(len(nums)), r):
            tried += 1
            if verify(nums, target, subset):
                return subset, tried
    return None, tried

print(' n   subsets tried by brute force   operations to verify the answer')
for n in [8, 12, 16, 20]:
    nums, target = instance(n)
    subset, tried = search(nums, target)
    print(f'{n:>2} {tried:>30,} {len(subset):>33}')
```

Brute force tries hundreds of thousands of subsets at n = 20 and doubles with every extra number; checking the answer it finds takes a handful of additions. (Subset sum also has a **pseudo-polynomial** dynamic-programming algorithm, O(n × target), which is fast when the numbers are small; NP-completeness is about the size of the input in bits.)

## 7.4 What to do with an NP-hard problem

| Approach | Example |
|---|---|
| Exact algorithms that are fast in practice | SAT and ILP solvers (MiniSat, CP-SAT, Gurobi) solve industrial instances with millions of variables |
| Approximation algorithms with guarantees | Vertex cover within 2×, metric TSP within 1.5× (Christofides) |
| Heuristics and local search | Greedy, simulated annealing, genetic algorithms for scheduling and routing |
| Exploit special structure | Interval scheduling, 2-SAT and bipartite matching are in P |
| Fixed-parameter algorithms | Vertex cover in O(2ᵏ n) for small cover size k |
| Pseudo-polynomial dynamic programming | Knapsack and subset sum with small numbers |

> TIP: In interviews, recognising that a problem is NP-hard (it looks like scheduling with conflicts, colouring, packing or TSP) is a strength. Say so, then propose a practical approach: constraints small enough for backtracking with pruning, a DP over a small parameter, or a greedy heuristic with a known bound.

## 7.5 Practical lessons

- The halting problem is undecidable by a diagonal argument; reductions spread undecidability to many problems.
- Rice's theorem: non-trivial behavioural properties of programs are undecidable, so analysers approximate.
- NP is "easy to check"; NP-complete problems are the hardest in NP; P versus NP is open.
- For NP-hard problems use solvers, approximations, heuristics, special structure or small parameters.
