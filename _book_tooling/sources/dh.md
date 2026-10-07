# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| D1.1 | Ask which of the three schema levels the change touches: internal (storage) or conceptual (tables and columns) |
| D1.2 | Every superset of a candidate key is a super key. For two keys, use inclusion–exclusion |
| D1.3 | (b) is division. In SQL, "every" becomes "there is no part that this supplier does not supply" |
| D1.4 | Two copies of Enrolled with the same roll and different course ids |
| D1.5 | Fold 1:N into the N side; M:N and multivalued attributes get their own tables; a weak entity's key includes its owner's key |
| D1.6 | Which relationships can be folded into an entity table, and which never can? |

## Part 2 hints

| Exercise | Hint |
|---|---|
| D2.1 | Keep applying any FD whose left side is inside your current set until nothing changes. Which attribute never appears on a right side? |
| D2.2 | Start from the attributes that are never determined; then try adding one attribute at a time |
| D2.3 | C and D appear only on the left. Count the prime attributes before testing 3NF |
| D2.4 | X → Y is implied exactly when Y ⊆ X<sup>+</sup> |
| D2.5 | Split right sides first, then look for an extraneous attribute in AB → C, then for a redundant FD |
| D2.6 | Check that every FD of G follows from F, and every FD of F follows from G |
| D2.7 | Find keys and prime attributes first; then test partial dependencies (2NF), then prime-or-superkey (3NF), then superkey (BCNF) |
| D2.8 | Find an FD whose left side is not a key; split into its closure and the rest; repeat on each part |
| D2.9 | In (b), which attribute appears in no FD at all? Where would it end up? |
| D2.10 | For two parts: does the common attribute set determine all of one part? For three, join two at a time |
| D2.11 | Do not look for D and A in one table. Run the restricted-closure test, chaining through the parts |
| D2.12 | With no non-trivial FDs, the only key is all three attributes. Are skills and projects independent of each other? |
| D2.13 | Which non-key attributes depend on product_id alone, and which on order_id alone? |

## Part 3 hints

| Exercise | Hint |
|---|---|
| D3.1 | Different transactions, same item, at least one write. Two reads never conflict |
| D3.2 | Draw one edge per conflicting pair, from the earlier operation's transaction to the later one's |
| D3.3 | Who does T3 read A from? Who writes A last? Is there a write by a transaction that never read A? |
| D3.4 | Count interleavings with a binomial coefficient. For serialisability, think about where T2's two operations can go relative to T1's operations on A |
| D3.5 | For each read, find whom it reads from and compare commit positions; then look for overwrites of uncommitted data |
| D3.6 | Missing after a crash, half done, seen half done, invalid state |
| D3.7 | T1 has no incoming edges and T4 no outgoing ones. What does the extra edge create? |

## Part 4 hints

| Exercise | Hint |
|---|---|
| D4.1 | Is there any lock request after the first unlock? |
| D4.2 | Each transaction holds the X lock that the other needs next |
| D4.3 | Compare timestamps: in both schemes only the younger transaction can ever be aborted |
| D4.4 | Track R-TS(A) and W-TS(A) after every operation. The Thomas rule changes only one of the abort conditions |
| D4.5 | First-committer-wins checks only items both transactions **wrote**. Make them write a common item |
| D4.6 | Map each problem to an anomaly: dirty read, non-repeatable read, phantom, write skew |
| D4.7 | Before locking a row, place an intention lock of the matching kind on every ancestor |

## Part 5 hints

| Exercise | Hint |
|---|---|
| D5.1 | Transactions committed before the checkpoint need nothing; undo may need records from before the checkpoint |
| D5.2 | Steal puts uncommitted data on disk (needs undo); no-force leaves committed data off disk (needs redo) |
| D5.3 | Start from the checkpoint's tables; an end record removes a transaction; the redo start is the smallest recLSN |
| D5.4 | Try each rule with a two-step update and a crash at the worst moment |

## Part 6 hints

| Exercise | Hint |
|---|---|
| D6.1 | Internal: p pointers + (p − 1) keys ≤ block. Leaf: n (key + record pointer) pairs + one next pointer ≤ block |
| D6.2 | Maximum uses full nodes everywhere; minimum uses a root with 2 children and half-full nodes elsewhere |
| D6.3 | Order 4 means at most three keys per node. Leaf splits copy the middle key up; internal splits move it |
| D6.4 | Write each key in binary and look at the last bits; double the directory only when a full bucket's local depth equals the global depth |
| D6.5 | Heap: half the file on average; sorted: log<sub>2</sub>; B+ tree: height + 1 |
| D6.6 | Simulate each policy frame by frame. This is a famous reference string |
| D6.7 | Equality, ordered range, low-cardinality analytics, and "never touch the table" |

## Part 7 hints

| Exercise | Hint |
|---|---|
| D7.1 | Block nested loop uses M − 2 pages for the outer. Hash join needs M > √(build side) |
| D7.2 | Runs = ⌈b/M⌉; each merge pass combines M − 1 runs; every pass reads and writes every page |
| D7.3 | Equality: 1/V; range: fraction of the value range; AND: multiply; FK join: size of the referencing table |
| D7.4 | Split the conjunction and push each condition to the lowest node that has all its attributes |
| D7.5 | Leftmost prefix, covering index, function on a column. Then look at the actual plan: statistics can surprise you |

## Part 8 hints

| Exercise | Hint |
|---|---|
| D8.1 | Writes need W live replicas and reads need R: a pair tolerates N − W and N − R failures |
| D8.2 | Ask what is worse for each system: a wrong answer or no answer |
| D8.3 | With mod N, a key stays only if h mod 10 = h mod 11 |
