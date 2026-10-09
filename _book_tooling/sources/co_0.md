# How to use this guide
%What this book covers, how its programs were run, and where theory of computation and compilers appear in interviews

Theory of computation and compiler design are core subjects in computer science degrees, appear in GATE and in written tests of some companies, and come up in interviews for roles in compilers, databases, developer tools, security and language-heavy products. They also explain everyday engineering: why a regular expression can hang a server, why some problems have no algorithm at all, why "NP-complete" means "stop looking for a fast exact algorithm", and how the code you write becomes instructions a machine runs.

The book has two halves. Chapters 1–7 are the **theory**: finite automata and regular expressions, context-free grammars and parsing, pushdown automata, Turing machines, decidability and complexity. Chapters 8–10 build a **working compiler** for a small language, from characters to tokens, syntax tree, checked program, bytecode, optimised bytecode and a virtual machine that runs it. Chapter 11 is the question bank.

## How the programs were run

Every automaton, grammar, machine and compiler stage in this book is implemented in Python 3.13 and was **run**; outputs are real. Proofs are explained in prose, and wherever a theorem makes a concrete prediction (a DFA with k states must fail on some string, a backtracking regex engine takes exponential steps, verifying a certificate is fast while finding one is slow), a program checks the prediction. Two modules saved by the guide (`automata.py` in Chapter 2 and `mini.py` in Chapter 10) are imported by the practice book, so build the guide first.

## Map of the guide

| Chapter | Topic | Typical question |
|---|---|---|
| 1 | Languages and finite automata | "Design a DFA for binary numbers divisible by 3" |
| 2 | Nondeterminism, subset construction, minimisation | "Convert this NFA to a DFA; minimise it" |
| 3 | Regular expressions and their limits | "Is {aⁿbⁿ} regular? Why can a regex take forever?" |
| 4 | Context-free grammars | "Is this grammar ambiguous? Encode operator precedence" |
| 5 | Parsing and pushdown automata | "Compute FIRST and FOLLOW; is the grammar LL(1)?" |
| 6 | Turing machines | "What can a Turing machine do that a PDA cannot?" |
| 7 | Decidability and complexity | "Prove the halting problem undecidable; what is NP-complete?" |
| 8 | Lexical analysis | "How does a lexer work? Why is it a DFA?" |
| 9 | Parsing to a syntax tree and semantic analysis | "Recursive descent with precedence; symbol tables" |
| 10 | Code generation, a virtual machine and optimisation | "Constant folding, dead code, liveness, register allocation" |
| 11 | Question bank and cheat sheet | Revision |

# Chapter 1: Languages and Finite Automata
%Alphabets, strings and languages; deterministic finite automata as programs with a fixed amount of memory

## 1.1 Vocabulary

| Term | Meaning | Example |
|---|---|---|
| Alphabet Σ | A finite set of symbols | {0, 1} |
| String | A finite sequence of symbols; ε is the empty string | 0110 |
| Σ* | All strings over Σ, including ε | ε, 0, 1, 00, 01, ... |
| Language | Any set of strings, L ⊆ Σ* | Binary numbers divisible by 3 |
| Decision problem | "Is the string w in L?" | Is 110 divisible by 3? |

A model of computation is judged by **which languages it can recognise**. The models in this book form a hierarchy:

| Machine | Memory | Recognises | Grammar (Chomsky) |
|---|---|---|---|
| Finite automaton (DFA/NFA) | Fixed number of states only | Regular languages | Regular (type 3) |
| Pushdown automaton | States plus one stack | Context-free languages | Context-free (type 2) |
| Linear bounded automaton | Tape as long as the input | Context-sensitive languages | Context-sensitive (type 1) |
| Turing machine | Unbounded tape | Recursively enumerable languages | Unrestricted (type 0) |

## 1.2 Deterministic finite automata

A **DFA** is a 5-tuple (Q, Σ, δ, q₀, F): states, alphabet, a transition function δ(state, symbol) → state, a start state and a set of accepting states. It reads the input once, left to right, and accepts if it ends in an accepting state. Its only memory is which state it is in.

**Binary numbers divisible by 3.** Reading bits left to right, the value v becomes 2v + b. Only v mod 3 matters, so three states (remainder 0, 1, 2) suffice: from remainder r on bit b go to (2r + b) mod 3.

```python run A three-state DFA for multiples of 3, checked against arithmetic
delta = {(r, b): (2 * r + int(b)) % 3 for r in range(3) for b in '01'}
start, accepting = 0, {0}

def accepts(w):
    state = start
    for symbol in w:
        state = delta[(state, symbol)]
    return state in accepting

for r in range(3):
    print(f'state {r}:  on 0 -> {delta[(r, "0")]},  on 1 -> {delta[(r, "1")]}')
tests = ['0', '11', '110', '1001', '111', '10010']
print({w: accepts(w) for w in tests})
agree = all(accepts(format(n, 'b')) == (n % 3 == 0) for n in range(5000))
print('agrees with n % 3 == 0 for n < 5000:', agree)
```

The same idea, "remember only what the future needs", gives a DFA for "divisible by k" with k states, for any k and any base. It is also the key idea behind minimisation (Chapter 2).

## 1.3 Combining automata: the product construction

Regular languages are **closed** under union, intersection and complement. For intersection, run two DFAs in parallel: the product DFA's states are pairs (p, q), and it accepts when both components accept. Complement just swaps accepting and non-accepting states of a complete DFA.

```python run Product of two DFAs: "divisible by 3" and "even number of 1s"
from itertools import product

div3 = {'states': [0, 1, 2], 'start': 0, 'accept': {0},
        'delta': {(r, b): (2 * r + int(b)) % 3 for r in range(3) for b in '01'}}
even1 = {'states': ['e', 'o'], 'start': 'e', 'accept': {'e'},
         'delta': {('e', '0'): 'e', ('e', '1'): 'o', ('o', '0'): 'o', ('o', '1'): 'e'}}

def intersect(A, B):
    states = list(product(A['states'], B['states']))
    delta = {((p, q), s): (A['delta'][(p, s)], B['delta'][(q, s)])
             for p, q in states for s in '01'}
    accept = {(p, q) for p, q in states if p in A['accept'] and q in B['accept']}
    return {'states': states, 'start': (A['start'], B['start']), 'accept': accept,
            'delta': delta}

def run(D, w):
    s = D['start']
    for c in w:
        s = D['delta'][(s, c)]
    return s in D['accept']

both = intersect(div3, even1)
print('product states:', len(both['states']))
ok = all(run(both, format(n, 'b')) == (n % 3 == 0 and bin(n).count('1') % 2 == 0)
         for n in range(5000))
print('accepts exactly multiples of 3 with an even number of 1s:', ok)
print('first few:', [n for n in range(40) if run(both, format(n, 'b'))])
```

Notice that 21 is missing from the list although it is a multiple of 3: in binary it is 10101, with three 1s, so the second automaton rejects it. Many multiples of 3 have an even number of 1s, but not all, and the product accepts exactly those satisfying **both** conditions, as its definition requires. Checking the construction against a direct definition over thousands of inputs is how you catch a wrong transition table.

## 1.4 Practical lessons

- A language is a set of strings; a machine model is characterised by the languages it can recognise.
- A DFA is a program with a fixed, finite memory: design it by asking what the rest of the input needs to know.
- Products of DFAs give intersection (and union); swapping accepting states gives complement.
- Test automata against a direct definition over many inputs; it catches design mistakes instantly.

# Chapter 2: Nondeterminism, Subset Construction and Minimisation
%NFAs and ε-moves, turning an NFA into a DFA, and finding the smallest DFA for a language

## 2.1 Nondeterministic finite automata

An **NFA** may have several transitions on the same symbol, or none, and **ε-transitions** that consume no input. It accepts if **some** sequence of choices ends in an accepting state. NFAs are often much smaller and easier to design than DFAs, and they recognise exactly the same languages.

**Example:** binary strings whose **third symbol from the end** is 1. An NFA guesses when the third-from-last symbol arrives: four states. A DFA must remember the last three symbols: eight states.

## 2.2 The subset construction

To simulate an NFA deterministically, track the **set** of states it could be in. Each reachable set becomes one DFA state. The module below implements NFAs with ε-moves, the subset construction, and DFA minimisation; it is saved as `automata.py` for later chapters and the practice book.

```python run NFA simulation, subset construction and minimisation (saved as automata.py)
from collections import deque

EPS = ''

class NFA:
    def __init__(self, delta, start, accept):
        # delta[(q, a)] -> set
        self.delta, self.start, self.accept = delta, start, set(accept)

    def closure(self, states):
        stack, seen = list(states), set(states)
        while stack:
            q = stack.pop()
            for r in self.delta.get((q, EPS), ()):
                if r not in seen:
                    seen.add(r); stack.append(r)
        return frozenset(seen)

    def step(self, states, a):
        return self.closure({r for q in states for r in self.delta.get((q, a), ())})

    def accepts(self, w):
        cur = self.closure({self.start})
        for a in w:
            cur = self.step(cur, a)
        return bool(cur & self.accept)

def subset_construction(nfa, alphabet):
    start = nfa.closure({nfa.start})
    delta, todo, seen = {}, deque([start]), {start}
    while todo:
        S = todo.popleft()
        for a in alphabet:
            T = nfa.step(S, a)
            delta[(S, a)] = T
            if T not in seen:
                seen.add(T); todo.append(T)
    accept = {S for S in seen if S & nfa.accept}
    return {'states': seen, 'start': start, 'accept': accept, 'delta': delta,
            'alphabet': alphabet}

def dfa_accepts(D, w):
    s = D['start']
    for a in w:
        s = D['delta'][(s, a)]
    return s in D['accept']

def minimise(D):
    """Moore's partition refinement: split blocks until each block's states agree."""
    states, alpha = list(D['states']), D['alphabet']
    block = {s: (s in D['accept']) for s in states}
    while True:
        sig = {s: (block[s],) + tuple(block[D['delta'][(s, a)]] for a in alpha)
                for s in states}
        ids = {v: i for i, v in enumerate(sorted(set(sig.values()), key=repr))}
        new = {s: ids[sig[s]] for s in states}
        if len(set(new.values())) == len(set(block.values())):
            break
        block = new
    names = {s: block[s] for s in states}
    return {'states': set(names.values()), 'start': names[D['start']], 'alphabet': alpha,
            'accept': {names[s] for s in D['accept']},
            'delta': {(names[s], a): names[D['delta'][(s, a)]] for s in states
                    for a in alpha}}

if __name__ == '__main__':
    import inspect
    src = 'from collections import deque\n\nEPS = \'\'\n\n' + '\n\n'.join(
        inspect.getsource(o) for o in (NFA, subset_construction, dfa_accepts, minimise))
    open('automata.py', 'w').write(src)

    # third symbol from the end is 1: guess the position with a nondeterministic jump
    third = NFA({(0, '0'): {0}, (0, '1'): {0, 1}, (1, '0'): {2}, (1, '1'): {2},
                 (2, '0'): {3}, (2, '1'): {3}}, 0, {3})
    D = subset_construction(third, '01')
    M = minimise(D)
    print('NFA states: 4   DFA states:', len(D['states']),
          '  after minimisation:', len(M['states']))
    import itertools
    words = [''.join(p) for n in range(9) for p in itertools.product('01', repeat=n)]
    agree = all(third.accepts(w) == dfa_accepts(D, w) == dfa_accepts(M, w)
                == (len(w) >= 3 and w[-3] == '1') for w in words)
    print('NFA, DFA and minimal DFA agree on all', len(words), 'strings up to length 8:',
            agree)
```

The subset construction produced eight reachable DFA states, and minimisation could not remove any: the language genuinely needs all eight, because the DFA must remember the last three symbols (2³ combinations). In the worst case an n-state NFA needs 2ⁿ DFA states ("third from the end" generalises to "k-th from the end", needing 2ᵏ), which is why regex engines often simulate the NFA directly instead of building the DFA.

## 2.3 Minimisation

Two states are **equivalent** if, for every possible remaining input, both accept or both reject. Merging equivalent states gives the unique **minimal DFA** for a language (up to renaming states); the Myhill–Nerode theorem says its number of states equals the number of classes of strings that the language distinguishes. Moore's algorithm above starts with two blocks (accepting and not) and splits blocks until all states in a block move to the same blocks on every symbol.

```python run A deliberately wasteful DFA shrinks to its minimal form
from automata import minimise, dfa_accepts

# a 6-state DFA for "number of 1s is divisible by 3", written with duplicated states
delta = {}
for q in range(6):
    delta[(q, '0')] = q
    delta[(q, '1')] = (q + 1) % 6
D = {'states': set(range(6)), 'start': 0, 'accept': {0, 3}, 'alphabet': '01',
        'delta': delta}
M = minimise(D)
print('states before:', len(D['states']), ' after:', len(M['states']))
same = all(dfa_accepts(D, format(n, 'b')) == dfa_accepts(M, format(n, 'b'))
        for n in range(3000))
print('same language on 3000 inputs:', same)
```

States q and q+3 behave identically (only the count of 1s modulo 3 matters), so the six states collapse to three. Minimal DFAs are used to check whether two regular expressions or two automata describe the same language: minimise both and compare.

## 2.4 Practical lessons

- NFAs guess; they accept if any path accepts. They recognise exactly the regular languages, like DFAs.
- The subset construction turns an NFA into a DFA whose states are sets of NFA states; it can blow up exponentially.
- The minimal DFA is unique; partition refinement finds it, and comparing minimal DFAs decides language equivalence.
- Simulating the NFA on the fly (tracking the set of current states) avoids building a huge DFA.
