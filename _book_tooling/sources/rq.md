# How to use this practice book
%25 exercises matching the Distributed Systems guide, with hints kept separate and executed solutions

Each part matches chapters of the **Distributed Systems** guide. Code exercises are short Python simulations in the guide's style: a seeded random generator stands in for the network, and every loop is capped. Numerical exercises can be done on paper; the solutions check them in code. Concept and design exercises are answered the way you would at a whiteboard: state the guarantee you need, then the mechanism that provides it.

| Type | What you do |
|---|---|
| Code | Write and run a simulation or checker |
| Numerical | Calculate, then check |
| Concept | Explain the guarantee, the failure and the trade-off |
| Design | Choose consistency levels and mechanisms for a system and justify them |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code, ✓ also requires that you state the **safety property** your program checks (what must never happen) and that it holds for several seeds. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Failures, clocks and ordering | 6 |
| 2 | 3–4 | Consistency, quorums and broadcast | 6 |
| 3 | 5 | Consensus | 6 |
| 4 | 6–9 | CRDTs, gossip, faults and design | 7 |

# Exercises

## Part 1: Failures, clocks and ordering

**R1.1 · Easy · Numerical · Retries and duplicates.** Each request and each reply is lost independently with probability 2%. A client tries up to 3 times, retrying when no reply arrives. What is the probability that it never gets a reply? If the operation is not idempotent, what is the probability that it is executed more than once?

**R1.2 · Medium · Code · Lamport timestamps.** Three nodes run: P1: a, send m1 to P2, b. P2: c, receive m1, send m2 to P3, d. P3: e, f, receive m2, g. Compute every event's Lamport timestamp and find two events with L(x) < L(y) that are nevertheless concurrent.

**R1.3 · Medium · Code · Which cart versions survive?** A Dynamo-style store holds four versions of a cart with version vectors over replicas (X, Y, Z): v1 = [2, 0, 0], v2 = [2, 1, 0], v3 = [2, 0, 1], v4 = [1, 0, 0]. Which versions can be discarded, which are siblings, and what version vector should the merged cart get when the client writes it back through replica X?

**R1.4 · Medium · Numerical · How often does LWW drop a later write?** Two nodes' clocks are each off by an independent, uniformly distributed error in ±25 ms. Node B writes 30 ms after node A, both with LWW timestamps. What is the probability that B's write is lost? Check by simulation, and repeat for writes 10 ms apart.

**R1.5 · Medium · Code · Tuning phi accrual.** Heartbeats arrive every 1,000 ms with a standard deviation of 100 ms (normally distributed). Compute φ after 1,200, 1,500 and 2,000 ms of silence. Which threshold gives at most one false suspicion per node per day, and how long after a real crash does that threshold fire?

**R1.6 · Hard · Concept · The payment that timed out.** A payment service calls the bank's transfer API and gets a timeout after 10 s. List what may have happened at the bank, explain why "retry" and "report failure" are both wrong as defaults, and design a safe protocol, including what to do if the bank offers no idempotency support.

## Part 2: Consistency, quorums and broadcast

**R2.1 · Medium · Code · Is it linearizable?** Using a checker (write one or adapt the guide's), decide whether each register history is linearizable (start, end in ms; initial value 0): (a) A writes 1 [0, 10], B reads 1 [2, 4], C reads 0 [6, 8]; (b) A writes 1 [0, 10], B reads 0 [2, 4], C reads 1 [6, 8]; (c) A writes 1 [0, 4], B writes 2 [2, 8], C reads 1 [9, 12]; (d) A writes 1 [0, 4], B writes 2 [6, 8], C reads 1 [9, 12].

**R2.2 · Medium · Concept · Name the broken guarantee.** For each anomaly, name the weakest guarantee that prevents it: (a) a user changes their profile picture and still sees the old one after refreshing; (b) a comment appears, then disappears on the next refresh; (c) a reply to a question is visible to someone who cannot yet see the question; (d) two users both register the username "asha"; (e) a user's two edits to a document are applied in the wrong order.

**R2.3 · Medium · Code · Causal delivery order.** Node A broadcasts m1; B receives m1 and broadcasts m2; C broadcasts m3 concurrently. Node D receives the messages in the order m2, m3, m1. Using vector-clock causal delivery, in what order does D deliver them, and which messages wait in its buffer?

**R2.4 · Easy · Numerical · Quorum arithmetic.** N = 5 replicas. (a) Which (W, R) pairs guarantee that every read quorum overlaps every write quorum? (b) For W = 3, R = 3, how many failed replicas can writes and reads each tolerate? (c) If each replica is independently down 1% of the time, what fraction of the time can a W = 3 write succeed? And W = 5?

**R2.5 · Medium · Code · When does order matter?** Three replicas receive the same five operations in different random orders. Show that a replicated counter (increments only) converges regardless of order, while a replicated account with an overdraft check does not, and explain what each needs.

**R2.6 · Medium · Concept · Where is linearizability needed?** For each feature, say whether it needs linearizability and why: (a) leader election for a job scheduler; (b) a social feed; (c) seat booking for a concert; (d) a video view counter; (e) an "is this coupon already redeemed?" check; (f) a product catalogue.

## Part 3: Consensus

**R3.1 · Easy · Numerical · Sizing and placing a cluster.** How many voters tolerate 2 failures? A team places 5 voters across 3 availability zones as 2–2–1 and asks whether the cluster survives the loss of any one zone. Another team uses 4 voters as 2–2 across two zones. Analyse both, and give the leader-election and replication quorum sizes that Flexible Paxos would allow for N = 6 with a replication quorum of 2.

**R3.2 · Medium · Code · What must the proposer propose?** Five acceptors have these states (promised, accepted): A1 (20, (20, Y)), A2 (20, (20, Y)), A3 (10, (10, X)), A4 (0, none), A5 (0, none). A proposer with ballot 30 receives promises from A3, A4 and A5 only. Which value must it propose, and is that safe? Simulate what happens if it instead hears from A1, A3 and A4.

**R3.3 · Medium · Code · Faster log repair.** A leader's log has entry terms [1, 1, 1, 4, 4, 5, 5, 6, 6, 6]; a follower's has [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]. Count the AppendEntries calls needed to repair it with one-step backtracking, then with the optimisation where the follower replies with the term of its conflicting entry and the first index of that term.

**R3.4 · Hard · Code · Computing the commit index.** A Raft leader in term 5 has log terms [1, 1, 3, 3, 5] (indexes 1–5) and match indexes for its four followers. Compute the commit index with the correct rule and with the naive "stored on a majority" rule for match indexes (a) [4, 4, 2, 1], (b) [5, 4, 2, 1], (c) [5, 5, 4, 4]. Explain any difference.

**R3.5 · Medium · Code · Who can win the election?** Five servers have these log terms: S1 [1, 1, 2], S2 [1, 1, 2, 2], S3 [1, 1, 3], S4 [1, 1], S5 [1, 1, 2, 2, 2]. For each server, which others would vote for it under the election restriction, and which servers can become leader?

**R3.6 · Medium · Concept · A partitioned Raft cluster.** A 5-node Raft cluster (leader S1) is partitioned into {S1, S2} and {S3, S4, S5}. Describe what each side does, what happens to client writes sent to S1, and what happens when the partition heals.

## Part 4: CRDTs, gossip, faults and design

**R4.1 · Medium · Code · 2P-set versus OR-set.** Show that a 2P-set cannot re-add an element after removing it, while an OR-set can, and show what each does when one replica removes "milk" while another concurrently adds it.

**R4.2 · Medium · Code · Siblings with an MV-register.** Implement a multi-value register with version vectors. Two clients write concurrently through different replicas, producing siblings; a third client reads both and writes a merged value. Show that the merged write supersedes both siblings everywhere.

**R4.3 · Easy · Numerical · Gossip at scale.** Estimate the rounds for push gossip with fanout 3 to reach 5,000 nodes, then simulate it. How many messages are sent in total, and how many per node?

**R4.4 · Medium · Numerical · SWIM by formula.** Derive the probability that SWIM falsely suspects a live node in one probe period, with packet loss *p* and *k* indirect probes. Evaluate it for the guide's cases and compare with the guide's simulated values.

**R4.5 · Medium · Code · How Merkle comparison scales.** For two replicas of 65,536 keys in 1,024 leaf ranges, measure the hashes compared when 1, 10, 100 and 1,000 keys differ. When does the tree stop paying off?

**R4.6 · Medium · Numerical · Fault-tolerance budgets.** How many nodes are needed to tolerate f = 1, 2, 3 crash faults and Byzantine faults? How many messages does one round of all-to-all relaying need at each size?

**R4.7 · Hard · Design · Likes and usernames, worldwide.** A social app runs in three regions. Design (a) the like counter on posts and (b) the username registry. For each, choose the consistency model, the replication mechanism and the user-visible behaviour during a network partition between regions.
