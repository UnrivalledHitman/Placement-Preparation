## Part 3 solutions

### Y3.1 A palindrome Turing machine

The machine erases the leftmost symbol, remembering it in its state (`ra` or `rb`), runs to the right end, checks that the last symbol matches, erases it, returns to the left end and repeats. An empty or one-symbol remainder means success.

```python run Crossing off matching ends, with step counts
def run_tm(delta, tape, start='q0', accept='acc', blank='_', max_steps=1_000_000):
    tape, head, state, steps = dict(enumerate(tape)), 0, start, 0
    while state not in (accept, 'rej') and steps < max_steps:
        sym = tape.get(head, blank)
        if (state, sym) not in delta:
            return False, steps
        state, write, move = delta[(state, sym)]
        tape[head] = write
        head += 1 if move == 'R' else -1
        steps += 1
    return state == accept, steps

delta = {('q0', '_'): ('acc', '_', 'R')}
for c in 'ab':
    delta[('q0', c)] = ('r' + c, '_', 'R')   # erase the first symbol, remember it
    for d in 'ab':
        delta[('r' + c, d)] = ('r' + c, d, 'R')            # run to the right end
    delta[('r' + c, '_')] = ('c' + c, '_', 'L')
    delta[('c' + c, c)] = ('back', '_', 'L')               # last symbol matches: erase it
    delta[('c' + c, '_')] = ('acc', '_', 'R')   # nothing left: odd-length palindrome
    delta[('back', c)] = ('back', c, 'L')
delta[('back', '_')] = ('q0', '_', 'R')

import itertools
words = [''.join(t) for n in range(11) for t in itertools.product('ab', repeat=n)]
print('agrees with w == reversed(w) on', len(words), 'strings:',
      all(run_tm(delta, w)[0] == (w == w[::-1]) for w in words))
for n in [4, 8, 16, 32]:
    w = 'ab' * (n // 4) + 'ba' * (n // 4)
    print(f'palindrome of length {n:>2}: {run_tm(delta, w)[1]:>4} steps')
```

Each round trip crosses the remaining string twice and removes two symbols, so the time is about n²/2 steps: doubling the length roughly quadruples the steps. A two-tape machine (copy, then compare backwards) does it in O(n), which shows that the number of tapes affects speed but not power.

### Y3.2 Decidable or not?

| Question | Answer | Reason |
|---|---|---|
| (a) DFA accepts some string of length 10? | Decidable | Intersect with the DFA for "length 10" and test emptiness (graph search) |
| (b) CFG generates all of Σ*? | Undecidable | Universality of CFGs is undecidable (reduction from Turing-machine computation histories) |
| (c) TM halts on empty input within 1,000 steps? | Decidable | Simulate for 1,000 steps; a **bounded** question always is |
| (d) A Java method ever returns null? | Undecidable in general | Rice's theorem: a non-trivial behavioural property. Tools approximate (null-safety types, annotations, static analysers with false positives) |
| (e) Two regular expressions equivalent? | Decidable | Convert to minimal DFAs and compare (or test the symmetric difference for emptiness) |

### Y3.3 Two reductions

**(a) Halting on every input (totality).** Given P and x, build P′ that ignores its own input and runs P on x. Then P′ halts on every input exactly when P halts on x. A decider for totality would decide the halting problem, so totality is undecidable (in fact it is not even recognisable).

**(b) Equivalence of programs.** Let Q be a program that ignores its input and immediately returns 0. Given P and x, build P′ that runs P on x and then returns 0. P′ computes the same function as Q exactly when P halts on x. A decider for equivalence would decide halting. This is why compilers cannot prove that an optimisation preserves meaning **in general**; each optimisation is proved correct once, by hand, for all programs.

### Y3.4 Graph colouring: verify, search, approximate

```python run Verify a 3-colouring of the Petersen graph, search for one, and fool greedy colouring
from itertools import product

outer = [(i, (i + 1) % 5) for i in range(5)]
spokes = [(i, i + 5) for i in range(5)]
inner = [(5 + i, 5 + (i + 2) % 5) for i in range(5)]
edges = outer + spokes + inner   # the Petersen graph: 10 vertices

def valid(colouring):   # polynomial: check every edge once
    return all(colouring[u] != colouring[v] for u, v in edges)

tries = 0
for colouring in product(range(3), repeat=10):   # exponential: 3^10 candidates
    tries += 1
    if valid(colouring):
        break
print(f'found {colouring} after {tries:,} tries; verifying it checks {len(edges)} edges')

n = 5   # crown graph: u_i ~ v_j for i != j
crown = [(('u', i), ('v', j)) for i in range(n) for j in range(n) if i != j]
adj = {}
for a, b in crown:
    adj.setdefault(a, set()).add(b); adj.setdefault(b, set()).add(a)

def greedy(order):
    colour = {}
    for v in order:
        used = {colour[w] for w in adj[v] if w in colour}
        colour[v] = next(c for c in range(len(order)) if c not in used)
    return len(set(colour.values()))

bad_order = [x for i in range(n) for x in (('u', i), ('v', i))]
good_order = [('u', i) for i in range(n)] + [('v', i) for i in range(n)]
print(f'crown graph, {2 * n} vertices: greedy uses {greedy(bad_order)} colours in a bad '
        f'order,'
      f' {greedy(good_order)} in a good one (2 is optimal)')
```

Verifying the colouring is a check of 15 edges; finding one took almost 8,000 candidates here and grows as 3ⁿ in the worst case. Greedy colouring is fast but its quality depends on the vertex order: on the crown graph, the alternating order makes it use n colours where 2 suffice. Heuristics such as ordering by degree (Welsh–Powell) or by saturation (DSatur) usually do far better, but no polynomial algorithm is known to always find the minimum, since 3-colouring is NP-complete.

### Y3.5 Which class?

| Problem | Class |
|---|---|
| 2-SAT | P (implication graph and strongly connected components, linear time) |
| 3-SAT | NP-complete |
| Shortest path, non-negative weights | P (Dijkstra) |
| Longest simple path | NP-hard (Hamiltonian path reduces to it) |
| Primality testing | P (AKS, 2002); in practice randomised Miller–Rabin |
| Integer factoring | In NP (and co-NP); not known to be in P or NP-complete; RSA relies on it being hard |
| Knapsack (decision) | NP-complete, with a pseudo-polynomial O(n·W) dynamic program |
| Linear programming | P (ellipsoid and interior-point methods; the simplex method is fast in practice) |
| Graph isomorphism | In NP, not known to be NP-complete; quasi-polynomial algorithm (Babai, 2015) |

## Part 4 solutions

### Y4.1 Programs in Mini

```python run gcd, primes below 50 and factorial, compiled and run
from mini import compile_program, execute

programs = {
    'gcd': '''fn gcd(a, b) {
    while (b != 0) { let t = b; b = a % b; a = t; }
    return a;
}
print gcd(84, 36); print gcd(17, 5);''',
    'primes': '''let n = 2;
while (n < 50) {
    let d = 2; let prime = true;
    while (d * d <= n && prime) { if (n % d == 0) { prime = false; } d = d + 1; }
    if (prime) { print n; }
    n = n + 1;
}''',
    'factorial': '''fn fact(n) { if (n < 2) { return 1; } return n * fact(n - 1); }
print fact(10); print fact(20);''',
}
for name, src in programs.items():
    out, steps = execute(*compile_program(src))
    print(f'{name:<9} {" ".join(out)}   ({steps:,} instructions)')
```

`gcd` modifies its parameters, which are just local slots. The primes program uses `&&` in the loop condition to stop dividing once a factor is found. `fact(20)` is 2,432,902,008,176,640,000, which fits because the VM uses Python integers; a real compiler targeting 64-bit integers would overflow at 21!.

### Y4.2 Constant propagation

```python run Propagating constants that are never reassigned, then folding again
from mini import parse, check, Compiler, execute, optimise, fold

def reassigned(stmts, names):
    for s in stmts:
        if s[0] == 'assign':
            names.add(s[1])
        for part in s[1:]:
            if isinstance(part, list):
                reassigned(part, names)
    return names

def substitute(e, consts):
    k = e[0]
    if k == 'var':
        return consts.get(e[1], e)
    if k == 'un':
        return ('un', e[1], substitute(e[2], consts), e[3])
    if k == 'bin':
        return ('bin', e[1], substitute(e[2], consts), substitute(e[3], consts), e[4])
    if k == 'call':
        return ('call', e[1], [substitute(a, consts) for a in e[2]], e[3])
    return e

def propagate(program):
    changed = reassigned(program, set())
    def block(stmts, consts):
        consts, out = dict(consts), []
        for s in stmts:
            k = s[0]
            if k == 'fn':   # functions see only their parameters
                s = ('fn', s[1], s[2], block(s[3], {}), s[4])
            elif k == 'let':
                value = fold(substitute(s[2], consts))
                if value[0] in ('num', 'bool') and s[1] not in changed:
                    consts[s[1]] = value
                else:
                    consts.pop(s[1], None)   # a non-constant shadows the name
                s = ('let', s[1], value, s[3])
            elif k == 'assign':
                s = ('assign', s[1], fold(substitute(s[2], consts)), s[3])
            elif k in ('print', 'expr', 'return'):
                s = (k, fold(substitute(s[1], consts)), s[2])
            elif k == 'if':
                s = ('if', fold(substitute(s[1], consts)), block(s[2], consts),
                     block(s[3], consts), s[4])
            elif k == 'while':
                s = ('while', fold(substitute(s[1], consts)), block(s[2], consts), s[3])
            out.append(s)
        return out
    return optimise(block(program, {}))

src = '''let width = 1920;
let height = 1080;
let pixels = width * height;
let debug = false;
let i = 0;
let sum = 0;
while (i < 500) { sum = sum + pixels / 1000; if (debug) { print i; } i = i + 1; }
print sum;'''
program = parse(src)
assert not check(program)
for label, transform in [('none', lambda p: p), ('folding only', optimise),
                         ('propagation + folding', propagate)]:
    code, nlocals = Compiler().compile(transform(program))
    out, steps = execute(code, nlocals)
    size = sum(map(len, code.values()))
    print(f'{label:<22} output {out}  instructions {size:>2}  executed {steps:>6,}')
```

Folding alone cannot help here, because every constant hides behind a variable. Propagation replaces `width`, `height`, `pixels` and `debug` by their values: `pixels / 1000` becomes `2073`, and `if (debug)` becomes `if (false)`, which dead-code elimination removes from the loop. The output is unchanged and the loop body shrinks. The "never reassigned" condition is the simple, safe version; real compilers do this per program point using SSA form, so even variables that change later can be propagated where their value is known.

### Y4.3 Predict the checker

Program and prediction:

```text
let count = 0;            -- fine
let flag = count;         -- fine: flag is int
fn half(n) { return n / 2; }
if (flag) { print 1; }                 -- line 4: if condition must be bool
while (count < 10) { count = count + true; }   -- line 5: '+' needs int operands
print half(1, 2);         -- line 6: half expects 1 argument(s), got 2
let count = 5;            -- line 7: 'count' already declared in this block
print total;              -- line 8: undefined variable 'total'
```

```python run The checker's actual report
from mini import parse, check

src = '''let count = 0;
let flag = count;
fn half(n) { return n / 2; }
if (flag) { print 1; }
while (count < 10) { count = count + true; }
print half(1, 2);
let count = 5;
print total;'''
for error in check(parse(src)):
    print(error)
```

### Y4.4 Prove short-circuit evaluation

```python run A function with a visible side effect, and the jumps that skip it
from mini import compile_program, execute, disassemble

src = '''fn noisy(x) { print 100 + x; return x; }
let no = false;
let yes = true;
if (no && noisy(1) > 0) { print 1; }
if (yes || noisy(2) > 0) { print 2; }
if (yes && noisy(3) > 0) { print 3; }'''
out, _ = execute(*compile_program(src))
print('output:', ' '.join(out))
code, _ = compile_program('let no = false; print no && 1 < 2;')
print(disassemble(code['main']))
```

Only `noisy(3)` ran (printing 103): with `no` false, `&&` never evaluated its right side, and with `yes` true, `||` never did either. In the disassembly, `JZ 8` jumps straight past the right operand to `PUSH False` when the left operand is false, so `1 < 2` is never computed. Short-circuiting is a **semantic** guarantee that programs rely on (`p != null && p.ok()`), not an optimisation the compiler may choose to skip.

### Y4.5 Making Mini fast

| Step | Idea | Typical gain |
|---|---|---|
| 1. Measure | Profile which programs and instructions dominate; add a benchmark suite | Directs effort |
| 2. Cheaper dispatch | Pre-decode instructions into tuples of functions or closures (no string comparisons), cache slot lookups | 2–3× |
| 3. Better bytecode | Superinstructions (`LOAD_PUSH_BIN`), compare-and-jump instructions, constant propagation and the optimisations of Chapter 10 | 1.5–2× |
| 4. Register VM | Three-address instructions (`ADD r1 r2 r3`) cut instruction count roughly in half versus a stack VM | 1.5–2× |
| 5. Compile to the host | Translate Mini functions to Python source and `exec` them, so Python's own bytecode runs them | 5–20× over the interpreter |
| 6. Native code | Emit LLVM IR (via `llvmlite`) or WebAssembly; LLVM supplies register allocation and machine-level optimisation | 50–100× |
| 7. JIT | Interpret first, profile, compile hot functions with type specialisation (as V8, HotSpot and PyPy do) | Best of both, most effort |

The order matters: measurement and cheap interpreter fixes come first; native code generation gives the largest gain but needs integer-overflow semantics, a runtime for calls and errors, and much more testing. For an interview, mentioning the trade-off between start-up time, peak speed and implementation effort (interpreter, AOT compiler, JIT) is the key insight.
