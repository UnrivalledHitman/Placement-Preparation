# How to use this practice book
%20 exercises matching the Compilers and Theory of Computation guide, with hints kept separate and executed solutions

Each part matches chapters of the **Compilers and Theory of Computation** guide. Code exercises ask you to build and test an automaton, grammar, machine or compiler extension; several import the guide's modules (`automata.py` from Chapter 2 and `mini.py` from Chapter 10), so build the guide first. Concept exercises are answered as in an exam or interview: a claim, then a reason.

| Type | What you do |
|---|---|
| Code | Implement it, then test it against a direct definition |
| Concept | State the answer and justify it (proof idea, reduction or counterexample) |
| Debug | Find why something misbehaves and fix it |
| Design | Plan an approach and its trade-offs |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code exercises, ✓ requires a test against an independent definition over many inputs, not just a few examples. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–3 | Automata and regular languages | 5 |
| 2 | 4–5 | Grammars, parsing and pushdown automata | 5 |
| 3 | 6–7 | Turing machines, decidability and complexity | 5 |
| 4 | 8–10 | Compiler construction | 5 |

# Exercises

## Part 1: Automata and regular languages

**Y1.1 · Easy · Code · No two a's in a row, even length.** Build a DFA over {a, b} accepting strings of even length that contain no `aa`, as the product of two smaller DFAs. Test it against the definition.

**Y1.2 · Medium · Code · From NFA to minimal DFA.** Design an NFA for strings over {a, b} that end in `ab` or contain `bab`. Convert it with the subset construction, minimise it, and report the sizes.

**Y1.3 · Medium · Concept · Regular or not?** Decide and justify: (a) aⁿbᵐ; (b) aⁿbⁿ with n ≤ 100; (c) binary strings with as many `01` substrings as `10` substrings; (d) aᵖ with p prime; (e) binary numbers divisible by 7. Check the surprising one with code.

**Y1.4 · Easy · Code · A regex for 24-hour times.** Write a regular expression for `HH:MM` times from 00:00 to 23:59 and test it exhaustively.

**Y1.5 · Medium · Debug · A validator that hangs.** The pattern `^(\d+)*$` takes seconds on `"1111111111111111111111x"`. Explain why, give an equivalent safe pattern, and prove equivalence on all short strings.

## Part 2: Grammars, parsing and pushdown automata

**Y2.1 · Medium · Code · Equal numbers of a's and b's.** Give a CFG for strings over {a, b} with equally many a's and b's, and check that it generates exactly those strings up to length 8.

**Y2.2 · Medium · Code · An ambiguous bracket grammar.** Show that `S → S S | ( S ) | ε` is ambiguous by counting parse trees for `()()()`, and give an unambiguous grammar for the same language.

**Y2.3 · Medium · Code · The dangling else in an LL(1) table.** For `S → if E then S S′ | other`, `S′ → else S | ε`, `E → b`, compute FIRST and FOLLOW, find the LL(1) conflict and explain how parsers resolve it.

**Y2.4 · Easy · Code · Three kinds of brackets.** Implement a deterministic PDA for balanced `()[]{}` and test it against a reference.

**Y2.5 · Medium · Code · A right-associative operator.** Add exponentiation `^` (binding tighter than `*`, right-associative) to a precedence-climbing parser and evaluator; show that `2 ^ 3 ^ 2` is 512.

## Part 3: Turing machines, decidability and complexity

**Y3.1 · Medium · Code · A palindrome Turing machine.** Write a Turing machine that accepts palindromes over {a, b} by crossing off matching end symbols. Test it and report how the step count grows.

**Y3.2 · Medium · Concept · Decidable or not?** For each, say decidable or undecidable, with a reason: (a) does a DFA accept some string of length 10? (b) does a CFG generate every string over its alphabet? (c) does a Turing machine halt on the empty input within 1,000 steps? (d) does a Java method ever return null? (e) are two regular expressions equivalent?

**Y3.3 · Medium · Concept · Two reductions.** Prove undecidable: (a) "does program P halt on every input?" (b) "do programs P and Q compute the same function?"

**Y3.4 · Medium · Code · Graph colouring: verify, search, approximate.** For a small graph, verify a proposed 3-colouring, find one by brute force (counting tries), and show a graph where greedy colouring in a bad order uses more colours than necessary.

**Y3.5 · Easy · Concept · Which class?** Classify: 2-SAT, 3-SAT, shortest path with non-negative weights, longest simple path, primality testing, integer factoring, knapsack, linear programming, graph isomorphism.

## Part 4: Compiler construction

**Y4.1 · Easy · Code · Programs in Mini.** Write Mini programs for the gcd of two numbers, the primes below 50 and a recursive factorial, and run them.

**Y4.2 · Hard · Code · Constant propagation.** Extend the optimiser so that variables declared with a constant and never reassigned are replaced by their value, enabling further folding. Measure the effect.

**Y4.3 · Easy · Debug · Predict the checker.** Predict every semantic error the Mini checker reports for a given program, then run it.

**Y4.4 · Medium · Code · Prove short-circuit evaluation.** Using a Mini function with a visible side effect, show that `&&` and `||` skip their right operand when the left decides the result, and point to the jumps in the bytecode that do it.

**Y4.5 · Hard · Design · Making Mini fast.** Mini programs run in a Python bytecode interpreter. Propose, in order of value for effort, how to make them run much faster.
