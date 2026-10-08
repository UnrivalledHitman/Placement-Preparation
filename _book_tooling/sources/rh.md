# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| R1.1 | An attempt gets a reply with probability (1 − p)<sup>2</sup>; it executes with probability 1 − p |
| R1.2 | Increment before each event; on receive take max(own, message) + 1 |
| R1.3 | A version is obsolete if another version's vector dominates it element-wise |
| R1.4 | The difference of the two errors has a triangular distribution on [−50, 50] ms |
| R1.5 | φ = −log<sub>10</sub>(P(a heartbeat arrives later than t)); one false suspicion per day is about one per 86,400 heartbeats |
| R1.6 | The transfer may have happened. What makes a second attempt harmless? |

## Part 2 hints

| Exercise | Hint |
|---|---|
| R2.1 | Try every order that respects real time; non-overlapping operations keep their order |
| R2.2 | Session guarantees, causal consistency, linearizability |
| R2.3 | Deliver m from s when V[s] = D[s] + 1 and V[k] ≤ D[k] for all other k |
| R2.4 | Overlap needs W + R > N; availability = P(at least W of N up) |
| R2.5 | Increments commute; overdraft checks do not |
| R2.6 | Does a stale or reordered answer cause a wrong decision, or just a slightly old view? |

## Part 3 hints

| Exercise | Hint |
|---|---|
| R3.1 | 2f + 1 voters; count what remains after the largest zone fails |
| R3.2 | Propose the value with the highest accepted ballot among the promises |
| R3.3 | With the optimisation, nextIndex jumps to the first index of the conflicting term |
| R3.4 | The highest N stored on a majority **with log[N].term == currentTerm** |
| R3.5 | Compare last log term first, then log length |
| R3.6 | Which side has a majority? What does a leader do without one? |

## Part 4 hints

| Exercise | Hint |
|---|---|
| R4.1 | A 2P-set's tombstone is permanent; an OR-set's remove covers only observed tags |
| R4.2 | A write's vector is the merge of the vectors it read, incremented at the replica |
| R4.3 | Roughly log<sub>(fanout + 1)</sub> N rounds, plus a few for the stragglers |
| R4.4 | Direct probe fails with 1 − (1 − p)<sup>2</sup>; an indirect path needs 4 messages |
| R4.5 | Each differing key forces a path from root to leaf |
| R4.6 | Crash: 2f + 1. Byzantine: 3f + 1. All-to-all: n(n − 1) messages |
| R4.7 | Counters merge; uniqueness needs a single decision |
