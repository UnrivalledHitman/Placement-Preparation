# Chapter 10: Code Generation, a Virtual Machine and Optimisation
%Compiling the syntax tree to stack bytecode, running it, folding constants, removing dead code, and allocating registers

## 10.1 Stack bytecode

Mini compiles to bytecode for a **stack machine**, the design used by the JVM, CPython and WebAssembly: instructions take operands from a stack and push results, so code generation is a simple post-order walk of the tree. Each function gets its own instruction list and a frame of numbered local slots; `let` allocates a new slot, so an inner block's variable can shadow an outer one. Control flow becomes jumps: `if` compiles to "evaluate the condition, jump past the then-block if false"; `&&` and `||` jump early so that the right operand is evaluated only when needed (**short-circuit evaluation**).

```python run Code generator and virtual machine (saved as mini_vm.py)
from mini_parse import parse, CompileError
from mini_check import check

class MiniRuntimeError(Exception):
    pass

def trunc_div(a, b):
    if b == 0:
        raise MiniRuntimeError('division by zero')
    q = abs(a) // abs(b)
    return q if (a >= 0) == (b >= 0) else -q          # round towards zero, as in C and Java

OPS = {'+': lambda a, b: a + b, '-': lambda a, b: a - b, '*': lambda a, b: a * b,
       '/': trunc_div, '%': lambda a, b: a - b * trunc_div(a, b),
       '<': lambda a, b: a < b, '<=': lambda a, b: a <= b, '>': lambda a, b: a > b,
       '>=': lambda a, b: a >= b, '==': lambda a, b: a == b, '!=': lambda a, b: a != b,
       '&&': lambda a, b: a and b, '||': lambda a, b: a or b}

class Compiler:
    def __init__(self):
        self.code, self.nlocals = {}, {}

    def compile(self, program):
        for s in program:
            if s[0] == 'fn':
                self.function(s[1], s[2], s[3])
        self.function('main', [], [s for s in program if s[0] != 'fn'])
        return self.code, self.nlocals

    def function(self, name, params, body):
        self.out, self.slots, self.scopes = [], 0, [{}]
        for p in params:
            self.declare(p)
        self.block(body, new_scope=False)
        self.emit('PUSH', 0); self.emit('RET')          # implicit "return 0"
        self.code[name], self.nlocals[name] = self.out, self.slots

    def declare(self, name):
        self.scopes[-1][name] = self.slots
        self.slots += 1
        return self.slots - 1

    def lookup(self, name):
        return next(sc[name] for sc in reversed(self.scopes) if name in sc)

    def emit(self, *ins):
        self.out.append(list(ins))
        return len(self.out) - 1

    def patch(self, at):
        self.out[at][1] = len(self.out)                 # jump target = next instruction

    def block(self, stmts, new_scope=True):
        if new_scope:
            self.scopes.append({})
        for s in stmts:
            self.stmt(s)
        if new_scope:
            self.scopes.pop()

    def stmt(self, s):
        k = s[0]
        if k == 'let':
            self.expr(s[2]); self.emit('STORE', self.declare(s[1]))
        elif k == 'assign':
            self.expr(s[2]); self.emit('STORE', self.lookup(s[1]))
        elif k in ('print', 'expr', 'return'):
            self.expr(s[1]); self.emit({'print': 'PRINT', 'expr': 'POP',
                    'return': 'RET'}[k])
        elif k == 'block':
            self.block(s[1])
        elif k == 'if':
            self.expr(s[1]); skip = self.emit('JZ', None)
            self.block(s[2])
            if s[3]:
                end = self.emit('JMP', None); self.patch(skip)
                self.block(s[3]); self.patch(end)
            else:
                self.patch(skip)
        elif k == 'while':
            top = len(self.out)
            self.expr(s[1]); leave = self.emit('JZ', None)
            self.block(s[2]); self.emit('JMP', top); self.patch(leave)

    def expr(self, e):
        k = e[0]
        if k in ('num', 'bool'):
            self.emit('PUSH', e[1])
        elif k == 'var':
            self.emit('LOAD', self.lookup(e[1]))
        elif k == 'un':
            self.expr(e[2]); self.emit('NEG' if e[1] == '-' else 'NOT')
        elif k == 'call':
            for a in e[2]:
                self.expr(a)
            self.emit('CALL', e[1], len(e[2]))
        elif e[1] in ('&&', '||'):                       # short circuit
            self.expr(e[2])
            early = self.emit('JZ' if e[1] == '&&' else 'JNZ', None)
            self.expr(e[3]); end = self.emit('JMP', None)
            self.patch(early); self.emit('PUSH', e[1] == '||'); self.patch(end)
        else:
            self.expr(e[2]); self.expr(e[3]); self.emit('BIN', e[1])

def execute(code, nlocals, max_steps=2_000_000, max_depth=500):
    out, stack, frames, steps = [], [], [], 0
    fname, pc, loc = 'main', 0, [0] * nlocals['main']
    while True:
        ins = code[fname][pc]; pc += 1; steps += 1
        op = ins[0]
        if op == 'PUSH':
            stack.append(ins[1])
        elif op == 'LOAD':
            stack.append(loc[ins[1]])
        elif op == 'STORE':
            loc[ins[1]] = stack.pop()
        elif op == 'BIN':
            b, a = stack.pop(), stack.pop()
            stack.append(OPS[ins[1]](a, b))
        elif op == 'NEG':
            stack.append(-stack.pop())
        elif op == 'NOT':
            stack.append(not stack.pop())
        elif op == 'JMP':
            pc = ins[1]
        elif op == 'JZ':
            if not stack.pop():
                pc = ins[1]
        elif op == 'JNZ':
            if stack.pop():
                pc = ins[1]
        elif op == 'PRINT':
            v = stack.pop()
            out.append(str(v).lower() if isinstance(v, bool) else str(v))
        elif op == 'POP':
            stack.pop()
        elif op == 'CALL':
            if len(frames) >= max_depth:
                raise MiniRuntimeError(f'stack overflow after {max_depth} nested calls')
            n = ins[2]
            args = stack[len(stack) - n:]; del stack[len(stack) - n:]
            frames.append((fname, pc, loc))
            fname, pc, loc = ins[1], 0, args + [0] * (nlocals[ins[1]] - n)
        elif op == 'RET':
            value = stack.pop()
            if not frames:
                return out, steps
            fname, pc, loc = frames.pop()
            stack.append(value)
        if steps > max_steps:
            raise MiniRuntimeError('step limit exceeded (infinite loop?)')

def compile_program(src, optimiser=None):
    program = parse(src)
    errors = check(program)
    if errors:
        raise CompileError('; '.join(errors))
    if optimiser:
        program = optimiser(program)
    return Compiler().compile(program)

def disassemble(instructions):
    return '\n'.join(f'{i:>3}  {ins[0]:<6}' + ' '.join(str(a) for a in ins[1:])
                     for i, ins in enumerate(instructions))

if __name__ == '__main__':
    module = open(__file__, encoding='utf-8').read().split("if __name__ ==")[0]
    open('mini_vm.py', 'w', encoding='utf-8').write(module)  # everything above this block

    fib = '''fn fib(n) {
    if (n < 2) { return n; }
    return fib(n - 1) + fib(n - 2);
}
let i = 0;
while (i < 10) { print fib(i); i = i + 1; }'''
    code, nlocals = compile_program(fib)
    out, steps = execute(code, nlocals)
    print('output:', ' '.join(out), f'  ({steps:,} instructions executed)')
    print('bytecode of fib:')
    print(disassemble(code['fib']))
    for src in ['let x = 10; print x / (5 - 5);',
            'fn f(n) { return f(n + 1); } print f(0);',
                'print 7 / -2; print -7 % 3; print false || 3 > 2;']:
        try:
            print(src, '->', ' '.join(execute(*compile_program(src))[0]))
        except MiniRuntimeError as e:
            print(src, '-> runtime error:', e)
```

The Fibonacci program prints the first ten Fibonacci numbers. The bytecode of `fib` shows the patterns: arguments arrive in slots, `JZ 6` skips the `return n` when `n < 2` is false, and the two recursive `CALL`s leave their results on the stack for `BIN +`. Runtime errors (division by zero, unbounded recursion) are caught by the VM; integer division truncates towards zero, so `7 / -2` is −3 and `-7 % 3` is −1, as in C and Java (Python's own `//` would give −4 and 2).

## 10.2 Optimisation on the syntax tree

An optimiser rewrites the program into a faster equivalent one. Two classic, safe transformations:

- **Constant folding**: evaluate operations on constants at compile time (`24 * 60 * 60` → `86400`), plus algebraic identities (`x * 1` → `x`, `x + 0` → `x`).
- **Dead-code elimination**: drop branches whose condition is a constant, loops that never run, and statements after a `return`.

```python run Constant folding and dead-code elimination, measured (saves mini.py)
from mini_vm import compile_program, execute, disassemble, OPS

def is_const(e):
    return e[0] in ('num', 'bool')

def fold(e):
    k = e[0]
    if k == 'un':
        x = fold(e[2])
        if is_const(x):
            return ('num', -x[1]) if e[1] == '-' else ('bool', not x[1])
        return ('un', e[1], x, e[3])
    if k == 'call':
        return ('call', e[1], [fold(a) for a in e[2]], e[3])
    if k != 'bin':
        return e
    op, l, r = e[1], fold(e[2]), fold(e[3])
    if is_const(l) and is_const(r) and not (op in '/%' and r[1] == 0):
        v = OPS[op](l[1], r[1])
        return ('bool', v) if isinstance(v, bool) else ('num', v)
    if (op in '+-' and r == ('num', 0)) or (op == '*' and r == ('num', 1)):
        return l
    if (op == '+' and l == ('num', 0)) or (op == '*' and l == ('num', 1)):
        return r
    return ('bin', op, l, r, e[4])

def optimise(stmts):
    out = []
    for s in stmts:
        k = s[0]
        if k in ('let', 'assign'):
            s = (k, s[1], fold(s[2]), s[3])
        elif k in ('print', 'expr', 'return'):
            s = (k, fold(s[1]), s[2])
        elif k == 'fn':
            s = ('fn', s[1], s[2], optimise(s[3]), s[4])
        elif k == 'if':
            cond = fold(s[1])
            if cond[0] == 'bool':                       # keep the chosen branch as a block
                s = ('block', optimise(s[2] if cond[1] else s[3]))
            else:
                s = ('if', cond, optimise(s[2]), optimise(s[3]), s[4])
        elif k == 'while':
            cond = fold(s[1])
            if cond == ('bool', False):
                continue
            s = ('while', cond, optimise(s[2]), s[3])
        out.append(s)
        if k == 'return':
            break   # the rest of the block is unreachable
    return out

if __name__ == '__main__':
    module = open(__file__, encoding='utf-8').read().split("if __name__ ==")[0]
    open('mini_opt.py', 'w', encoding='utf-8').write(module)
    open('mini.py', 'w').write('from mini_lex import *\nfrom mini_parse import *\n'
                               'from mini_check import *\nfrom mini_vm import *\nfrom mini_opt import *\n')

    src = '''fn scale(x) { return x * 1 + 0; print 999; }
let seconds_per_day = 24 * 60 * 60;
let i = 0;
let total = 0;
while (i < 1000) { total = total + i * (2 * 3 - 5); i = i + 1; }
if (1 > 2) { print -1; } else { print total; }
while (false) { print 0; }
print seconds_per_day;
print scale(7);'''
    for label, opt in [('unoptimised', None), ('optimised', optimise)]:
        code, nlocals = compile_program(src, opt)
        out, steps = execute(code, nlocals)
        size = sum(len(c) for c in code.values())
        print(f'{label:<12} output {out}  instructions {size:>3}  executed {steps:>6,}')
    print('optimised scale():')
    print(disassemble(compile_program(src, optimise)[0]['scale']))
```

The output is identical, the program has about half as many instructions, and it executes almost a third fewer, nearly all from the loop: `i * (2 * 3 - 5)` folded to `i * 1` and then to `i`, removing six instructions (three pushes and three arithmetic operations) from each of 1,000 iterations. `scale` lost its arithmetic and its unreachable `print`. The always-false `if` and `while` disappeared.

> TRAP: Optimisations must preserve meaning exactly. `x * 0` → `0` is wrong if `x` is a call with side effects (or, in floating point, if `x` is NaN or infinity); `x / x` → `1` is wrong when `x` is 0. Mini's folder skips division by a constant zero so that the runtime error still happens at run time.

| Further optimisation | What it does |
|---|---|
| Constant propagation | Replace a variable by its known constant value, enabling more folding |
| Common-subexpression elimination | Compute `a * b` once when it appears twice with unchanged operands |
| Loop-invariant code motion | Move computations that do not change inside a loop out of it |
| Strength reduction | Replace `i * 4` in a loop by an addition carried across iterations |
| Inlining | Replace a call by the function body (enables the others across calls) |
| Peephole optimisation | Rewrite short instruction sequences (`PUSH x; POP` → nothing) |

Production compilers do most of this on an intermediate representation in **static single assignment** (SSA) form, where each variable is assigned exactly once, which makes these data-flow facts easy to compute.

## 10.3 Liveness and register allocation

Real machines have few registers. A compiler targeting them computes **liveness** (a variable is live at a point if its current value may be used later), builds an **interference graph** (variables live at the same time cannot share a register), and **colours** the graph with k colours, one per register. Variables that cannot be coloured are **spilled** to memory.

```python run Liveness analysis and graph-colouring register allocation for straight-line code
code = [                      # three-address code: (destination, operands used)
    ('a', ['x']), ('b', ['y']), ('c', ['a', 'b']), ('d', ['a']),
    ('e', ['c', 'd']), ('f', ['e', 'b']), ('out', ['f']),
]

live, live_sets = set(), []
for dest, uses in reversed(code):   # backwards: live_in = uses + (live_out - def)
    live = (live - {dest}) | set(uses)
    live_sets.append(set(live))
live_sets.reverse()
for (dest, uses), lv in zip(code, live_sets):
    print(f'{dest:>3} = {" op ".join(uses):<8} live before: {sorted(lv)}')

graph = {}
for lv in live_sets:
    for v in lv:
        graph.setdefault(v, set()).update(lv - {v})

def allocate(k):
    order = sorted(graph, key=lambda v: -len(graph[v]))    # most constrained first
    colour, spilled = {}, []
    for v in order:
        taken = {colour[n] for n in graph[v] if n in colour}
        free = [r for r in range(k) if r not in taken]
        if free:
            colour[v] = free[0]
        else:
            spilled.append(v)
    return colour, spilled

print('interference:')
for v, n in sorted(graph.items()):
    print(f'  {v}: {sorted(n)}')
for k in (2, 3):
    colour, spilled = allocate(k)
    regs = ', '.join(f'{v}->r{c}' for v, c in sorted(colour.items()))
    print(f'{k} registers: {regs}; spilled: {spilled or "none"}')
```

At most three values are live at once (for example `a`, `b` and `c` before computing `d`), so three registers suffice and two force a spill. Real allocators use Chaitin–Briggs graph colouring or the faster **linear-scan** allocation used by JIT compilers, and choose spill candidates by how often a variable is used inside loops.

## 10.4 Practical lessons

- Stack bytecode is generated by a post-order walk of the tree; control flow becomes jumps patched with targets.
- A virtual machine interprets bytecode with a value stack and a stack of call frames.
- Constant folding and dead-code elimination are simple and safe; every optimisation must preserve exact meaning.
- Liveness gives an interference graph; colouring it with k colours allocates k registers, and the rest are spilled.

# Chapter 11: Question Bank and Cheat Sheet
%Interview and exam questions with the core of a good answer, and one-page reminders

## 11.1 Automata and languages

| Question | Core of a good answer |
|---|---|
| DFA versus NFA? | Same power (regular languages); NFAs can be exponentially smaller; subset construction converts |
| How do you minimise a DFA? | Remove unreachable states, then merge equivalent states by partition refinement (Moore or Hopcroft) |
| Is {aⁿbⁿ} regular? | No: pumping lemma (or a DFA with k states cannot distinguish k + 1 prefixes aⁱ) |
| Regex to NFA? | Thompson's construction, one fragment per operator, O(length) states |
| Why can a regex take exponential time? | Backtracking engines explore all ways to match nested quantifiers; NFA simulation is linear |
| Closure of regular languages? | Union, intersection, complement, concatenation, star, reversal |
| CFG versus regular grammar? | CFGs allow nesting (a stack); regular grammars only a finite state |
| What is an ambiguous grammar? | Some string has two parse trees; fix with a layered grammar or precedence rules |
| PDA versus DPDA? | Nondeterministic PDAs recognise all CFLs; deterministic ones are strictly weaker (wwᴿ) |
| Are CFLs closed under intersection? | No: aⁿbⁿcᵐ ∩ aᵐbⁿcⁿ = aⁿbⁿcⁿ is not context-free |

## 11.2 Computability and complexity

| Question | Core of a good answer |
|---|---|
| What is a Turing machine? | Finite control, unbounded tape, read/write head; the standard model of computation |
| Church–Turing thesis? | Every effectively computable function is Turing-computable; all reasonable models are equivalent |
| Prove the halting problem undecidable | Diagonalisation: a decider would let you build a program that does the opposite of its prediction about itself |
| Decidable versus recognisable? | Decider always halts; recogniser halts on members, may loop on non-members |
| Rice's theorem? | Any non-trivial property of a program's behaviour is undecidable |
| P versus NP? | P: solvable in polynomial time; NP: verifiable in polynomial time; equality is open |
| NP-complete versus NP-hard? | NP-hard: everything in NP reduces to it; NP-complete: NP-hard and in NP |
| How do you show a problem is NP-complete? | Show it is in NP, then reduce a known NP-complete problem to it in polynomial time |
| Is knapsack NP-complete if there is an O(nW) DP? | Yes: O(nW) is pseudo-polynomial, exponential in the number of bits of W |

## 11.3 Compilers

| Question | Core of a good answer |
|---|---|
| Phases of a compiler? | Lexing, parsing, semantic analysis, IR generation, optimisation, code generation |
| What does a lexer do? How? | Groups characters into tokens using regular expressions compiled to a DFA; maximal munch, keyword priority |
| LL versus LR parsing? | Top-down with prediction versus bottom-up shift-reduce; LR handles more grammars, LL is easy to write by hand |
| FIRST and FOLLOW? | Terminals that can start a derivation of α; terminals that can follow A; used to build LL(1) tables |
| Left recursion? | A → Aα breaks top-down parsers; rewrite as A → βA′, A′ → αA′ \| ε |
| What is an AST? | The program's structure without punctuation, used by all later phases |
| What is a symbol table? | Mapping from names to declarations (type, slot, scope); a stack of tables for nested scopes |
| Static versus dynamic typing? | Types checked at compile time versus at run time |
| Stack VM versus register VM? | Stack: simple code generation (JVM, CPython); register: fewer instructions (Lua, Dalvik) |
| Compiler versus interpreter versus JIT? | Translate ahead of time; execute directly; compile hot code at run time using observed behaviour |
| Name some optimisations | Constant folding and propagation, dead code, CSE, loop-invariant motion, inlining, strength reduction |
| What is SSA? | Each variable assigned once, with φ-functions at joins; makes data-flow optimisations simpler |
| What is register allocation? | Map variables to registers via liveness and graph colouring (or linear scan); spill the rest |
| What is garbage collection? | Automatic memory reclamation: reference counting, mark-sweep, copying, generational collectors |

## 11.4 Cheat sheet

| Topic | Remember |
|---|---|
| Chomsky hierarchy | Regular ⊂ context-free ⊂ context-sensitive ⊂ recursively enumerable; DFA, PDA, LBA, TM |
| Regular | DFA = NFA = regex; pumping lemma; closed under everything usual; equivalence decidable |
| Context-free | CFG = NPDA; CYK O(n³); not closed under ∩ or complement; equivalence undecidable |
| Turing machines | Church–Turing thesis; universal machine; halting undecidable but recognisable |
| Complexity | P ⊆ NP; NP-complete via polynomial reductions; Cook–Levin: SAT is NP-complete |
| Lexing | Regex per token, maximal munch, keyword priority, positions on every token |
| Parsing | Recursive descent and precedence climbing; LL(1) via FIRST/FOLLOW; LR via shift-reduce tables |
| Semantics | Scope stack of symbol tables; type rules; collect all errors |
| Codegen | Post-order walk to stack code; jumps for control flow; frames for calls |
| Optimisation | Must preserve meaning; folding, dead code, propagation, CSE, loops, inlining; SSA |
| Registers | Liveness → interference graph → k-colouring → spills |
