# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| Y1.1 | One DFA tracks parity of length, the other whether the last symbol was `a` (plus a dead state) |
| Y1.2 | Two branches from the start state with ε-moves; `automata.py` does the rest |
| Y1.3 | Count the transitions between runs of 0s and 1s; what does it depend on? |
| Y1.4 | Hours are `[01]\d` or `2[0-3]`; minutes are `[0-5]\d` |
| Y1.5 | How many ways can `(\d+)*` split a run of n digits? |

## Part 2 hints

| Exercise | Hint |
|---|---|
| Y2.1 | `S → a S b S \| b S a S \| ε` |
| Y2.2 | Count trees with a memoised function over substrings; Catalan numbers appear |
| Y2.3 | What can follow S′? Look at where S appears on right-hand sides |
| Y2.4 | Push openers; a closer must match the top of the stack |
| Y2.5 | For right associativity, parse the right operand with the same minimum precedence |

## Part 3 hints

| Exercise | Hint |
|---|---|
| Y3.1 | Remember the first symbol in the state, run to the far end, compare, cross off, return |
| Y3.2 | Bounded questions and questions about finite automata are usually decidable; Rice's theorem covers the rest |
| Y3.3 | Build a new program from P that ignores its input, or compare P with a program that always halts |
| Y3.4 | Verification checks every edge; greedy order matters on a "crown" graph |
| Y3.5 | Some famous problems are in NP but not known to be NP-complete |

## Part 4 hints

| Exercise | Hint |
|---|---|
| Y4.1 | Mini has `%`, `while`, `if`, recursion and `print` |
| Y4.2 | First find names assigned exactly once (by `let`) to a constant; then substitute and fold again |
| Y4.3 | Walk the checker's rules statement by statement |
| Y4.4 | A function that prints its argument makes every call visible |
| Y4.5 | Interpreter overhead, then a better execution model, then native code |
