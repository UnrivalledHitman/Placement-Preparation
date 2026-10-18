# How to use the practice sets
%312 original questions in GATE format, tiered Easy, Medium and Hard, with every answer computed

Each set matches one block of the syllabus and one part of Volume 1 of the guide. Every set has three tiers:

| Tier | Level | How to use it |
|---|---|---|
| Easy (8 questions) | One idea, one step; most GATE one-mark questions look like this | After reading the chapter; aim for 7 or 8 correct |
| Medium (9 questions) | Two ideas combined, or a careful calculation; typical two-mark questions | Same week; aim for 6 or more |
| Hard (7 questions) | The hardest questions in the 2025–26 papers and a little beyond | On a second pass, a few weeks later; 4 or more is strong |

The question types follow the exam: **MCQ** (one correct option, negative marks), **MSQ** (one or more correct options, all must be chosen) and **NAT** (type a number, rounded as instructed). About a third of the questions are MCQ, a quarter MSQ and the rest NAT. That is more NAT than the exam, where it was about a quarter of the 2025–26 subject questions. With no options to eliminate, typing a number is the strictest test of whether you can really do a calculation. The mock papers follow the exam's exact mix. MSQs have one, two or three correct options, so never assume a fixed number. Easy questions are marked as one-mark questions, and Medium and Hard as two-mark questions.

The questions are original. They test the same ideas, at the same difficulty, as the published papers, which you should also practise; their topic index is in the guide. Answers and worked solutions are in the second half of this book, set by set. Every numerical answer there is computed by a program shown with the solutions.

**Marking yourself.** Score each tier: +1 or +2 for a correct answer, −1/3 or −2/3 for a wrong MCQ, 0 for a wrong MSQ or NAT. Record the scores in the tracker at the end and redo every question you got wrong a week later.

| Set | Topic | Guide chapter |
|---|---|---|
| P1 | Counting | 1 |
| P2 | Probability, conditioning, independence and Bayes | 1 |
| P3 | Random variables, expectation and variance | 2 |
| P4 | Joint behaviour, covariance, conditional expectation and descriptive statistics | 2 |
| P5 | Discrete distributions | 3 |
| P6 | Continuous distributions | 3 |
| P7 | The CLT, confidence intervals and tests | 4 |
| L1 | Vector spaces, rank, linear systems and determinants | 5 |
| L2 | Eigenvalues and eigenvectors | 6 |
| L3 | Special matrices, quadratic forms and projections | 6 |
| L4 | LU, SVD and least squares | 5–6 |
| C1 | Limits, continuity, differentiability and series | 7 |
| C2 | Maxima, minima, convexity and optimisation | 7 |

# Probability and statistics

## Set P1: Counting

### Easy

**P1.E1** · MCQ · 1 mark. The number of distinct arrangements of the letters of BANANA is (A) 120 (B) 60 (C) 720 (D) 36

**P1.E2** · NAT · 1 mark. A committee of 3 is chosen from 7 men and 5 women. In how many ways can it contain exactly 2 women?

**P1.E3** · MCQ · 1 mark. The number of non-negative integer solutions of x₁ + x₂ + x₃ = 10 is (A) 120 (B) 55 (C) 45 (D) 66

**P1.E4** · NAT · 1 mark. How many 5-digit numbers can be formed from the digits 1 to 9 if no digit repeats?

**P1.E5** · MCQ · 1 mark. A set S has 6 elements, one of which is a. The number of subsets of S that contain a is (A) 64 (B) 63 (C) 32 (D) 31

**P1.E6** · MCQ · 1 mark. In how many ways can 7 people sit around a round table, if arrangements that differ only by rotation are the same? (A) 5040 (B) 120 (C) 360 (D) 720

**P1.E7** · MSQ · 1 mark. Which of the following equal C(10, 3)? (A) P(10, 3) (B) C(9, 2) + C(9, 3) (C) (10 × 9 × 8)/2! (D) C(10, 7)

**P1.E8** · NAT · 1 mark. How many integers from 1 to 100 are divisible by 3 or by 5?

### Medium

**P1.M1** · NAT · 2 marks. How many solutions does x₁ + x₂ + x₃ + x₄ = 12 have in positive integers?

**P1.M2** · MSQ · 2 marks. Consider integer solutions of x₁ + x₂ + x₃ = 15 with x₁ ≥ 2, x₂ ≥ 3 and x₃ ≥ 0. Which statements are correct? (A) Substituting y₁ = x₁ − 2 and y₂ = x₂ − 3 gives y₁ + y₂ + x₃ = 10 in non-negative integers (B) There are C(17, 2) solutions (C) There are C(12, 2) = 66 solutions (D) Without the lower bounds there would be C(17, 2) = 136 solutions

**P1.M3** · MCQ · 2 marks. Eight identical balls are placed in 3 distinct boxes so that no box is empty. The number of ways is (A) 45 (B) 36 (C) 21 (D) 28

**P1.M4** · NAT · 2 marks. How many integers from 1 to 1000 are divisible by none of 2, 3 and 5?

**P1.M5** · MCQ · 2 marks. The number of 4-letter strings over the alphabet {a, b, c, d, e} (letters may repeat) that contain at least one a is (A) 256 (B) 369 (C) 500 (D) 125

**P1.M6** · MSQ · 2 marks. A committee of 4 is chosen from 6 men and 4 women. Which statements are correct? (A) 24 committees are all-female (B) 15 committees are all-male (C) 185 committees contain at least one woman (D) 90 committees contain exactly two women

**P1.M7** · MSQ · 2 marks. Dₙ denotes the number of derangements of n objects (permutations with no fixed point). Which statements are correct? (A) D₅ = 45 (B) Dₙ = n·Dₙ₋₁ for n ≥ 2 (C) D₄ = 9 (D) D₄ = 4! − C(4, 1)3! + C(4, 2)2! − C(4, 3)1! + C(4, 4)0!

**P1.M8** · NAT · 2 marks. How many bijections f from {1, 2, 3, 4, 5, 6} to itself satisfy f(f(x)) = x for every x?

**P1.M9** · MCQ · 2 marks. The number of binary strings of length 10 with exactly four 1s, no two of them adjacent, is (A) 35 (B) 70 (C) 210 (D) 56

### Hard

**P1.H1** · NAT · 2 marks. In how many arrangements of the letters of MISSISSIPPI are no two S's adjacent?

**P1.H2** · MSQ · 2 marks. Consider functions from a 5-element set A to a 3-element set B. Which statements are correct? (A) There are 150 onto functions (B) There are 60 one-to-one functions (C) There are 243 functions (D) There are 93 functions that miss at least one element of B

**P1.H3** · MCQ · 2 marks. The number of non-negative integer solutions of x₁ + x₂ + x₃ = 10 with every xᵢ ≤ 5 is (A) 21 (B) 45 (C) 36 (D) 51

**P1.H4** · NAT · 2 marks. A path from (0, 0) to (5, 5) moves one unit right or one unit up at each step. How many such paths never go above the line y = x?

**P1.H5** · MSQ · 2 marks. Six people are split into groups. Which counts are correct? (A) Into 2 unordered groups of 3: 20 ways (B) Into one group of 2 and one group of 4: 30 ways (C) Into 3 unordered pairs: 15 ways (D) Into 3 pairs labelled Team 1, Team 2, Team 3: 90 ways

**P1.H6** · NAT · 2 marks. How many non-negative integer solutions does x₁ + x₂ + x₃ + x₄ = 20 have in which x₁ is even?

**P1.H7** · NAT · 2 marks. How many 5-card hands from a standard 52-card deck contain exactly one pair (two cards of one rank and three cards of three other, different ranks)?

## Set P2: Probability, conditioning, independence and Bayes

### Easy

**P2.E1** · MCQ · 1 mark. A and B are independent with P(A) = 0.5 and P(B) = 0.4. Then P(A ∪ B) is (A) 0.9 (B) 0.2 (C) 0.7 (D) 0.6

**P2.E2** · NAT · 1 mark. Two fair dice are thrown. Find the probability that the sum is 8. (Round off to two decimal places)

**P2.E3** · MCQ · 1 mark. A and B are mutually exclusive with P(A) = 0.3 and P(B) = 0.5. Then P(A ∩ B) is (A) 0.15 (B) 0.8 (C) 0 (D) 0.2

**P2.E4** · MCQ · 1 mark. P(A) = 0.6 and P(B | A) = 0.5. P(A ∩ B) is (A) 0.1 (B) 1.1 (C) 0.5 (D) 0.3

**P2.E5** · MSQ · 1 mark. Which statements hold for all events A and B (with P(A) > 0 where needed)? (A) P(A ∩ B) ≥ P(A) (B) P(Aᶜ) = 1 − P(A) (C) P(A ∪ B) ≥ P(A) + P(B) (D) If A ⊆ B, then P(B | A) = 1

**P2.E6** · NAT · 1 mark. A card is drawn from a standard deck. Given that it is a face card (J, Q or K), find the probability that it is a king. (Round off to two decimal places)

**P2.E7** · MCQ · 1 mark. Three fair coins are tossed. The probability of at least one head is (A) 7/8 (B) 3/8 (C) 1/2 (D) 1/8

**P2.E8** · NAT · 1 mark. P(A) = 0.4, P(B) = 0.5 and P(A ∪ B) = 0.7. Find P(A | B).

### Medium

**P2.M1** · MSQ · 2 marks. Machines M1, M2 and M3 make 50%, 30% and 20% of a factory's output, with defect rates 1%, 2% and 3%. Which statements are correct? (A) P(M1 | defective) > P(M3 | defective) (B) P(M3 | defective) ≈ 0.35 (C) P(M2 | defective) = P(M3 | defective) (D) P(an item is defective) = 0.017

**P2.M2** · MCQ · 2 marks. A and B are independent with P(A) = 1/3 and P(B) = 1/4. The probability that exactly one of them occurs is (A) 7/12 (B) 1/2 (C) 1/12 (D) 5/12

**P2.M3** · NAT · 2 marks. Five people each have a birth month chosen uniformly and independently from the 12 months. Find the probability that at least two share a birth month. (Round off to two decimal places)

**P2.M4** · MSQ · 2 marks. Two fair dice are thrown. A = "the first die is even", B = "the sum is 7", C = "the second die shows 1". Which statements are correct? (A) A and B are independent (B) A and C are independent (C) B and C are independent (D) A, B and C are mutually independent

**P2.M5** · NAT · 2 marks. An urn has 5 red and 3 blue balls. Two are drawn without replacement. Given that the second ball is red, find the probability that the first was red. (Round off to two decimal places)

**P2.M6** · MCQ · 2 marks. In the Monty Hall game (three doors, one prize; after your pick, the host, who knows where the prize is, opens another door with no prize and offers a switch), the probability of winning by switching is (A) 2/3 (B) 1/3 (C) 1/2 (D) 3/4

**P2.M7** · NAT · 2 marks. A coin with P(head) = 0.6 is tossed until the first head. Find the probability that more than 3 tosses are needed. (Round off to three decimal places)

**P2.M8** · MSQ · 2 marks. 40% of emails are spam. The word "free" appears in 60% of spam emails and 5% of other emails. Which statements are correct? (A) P(an email contains "free") = 0.65 (B) P(spam | no "free") ≈ 0.40 (C) Seeing "free" raises the probability of spam (D) P(spam | contains "free") ≈ 0.89

**P2.M9** · MCQ · 2 marks. P(A) = 0.5 and P(B) = 0.6. The smallest possible value of P(A ∩ B) is (A) 0.3 (B) 0 (C) 0.5 (D) 0.1

### Hard

**P2.H1** · NAT · 2 marks. A disease has prevalence 1%. A test has sensitivity 0.95 (positive if diseased) and specificity 0.90 (negative if healthy). A person is tested twice, and the two results are independent given their true condition. Both results are positive. Find the probability that the person has the disease. (Round off to two decimal places)

**P2.H2** · NAT · 2 marks. Five guests each choose one of 3 rooms uniformly and independently. Find the probability that no room is left empty. (Round off to two decimal places)

**P2.H3** · MCQ · 2 marks. A gambler starts with ₹3 and bets ₹1 on each toss of a fair coin, stopping on reaching ₹0 or ₹10. The probability of reaching ₹10 is (A) 0.03 (B) 0.5 (C) 0.7 (D) 0.3

**P2.H4** · MSQ · 2 marks. An urn starts with 1 red and 1 blue ball. A ball is drawn and returned together with another ball of the same colour; then a second draw is made. Which statements are correct? (A) P(the second draw is red) = 1/2 (B) P(the first draw was red | the second draw is red) = 2/3 (C) P(both draws are red) = 1/3 (D) The two draws are independent

**P2.H5** · MSQ · 2 marks. A and B are events with probabilities strictly between 0 and 1. Which statements are always true? (A) If A ⊆ B, then A and B are independent (B) If P(A | B) = P(A), then P(B | A) = P(B) (C) If A and B are independent, so are Aᶜ and Bᶜ (D) If A and B are mutually exclusive, they are independent

**P2.H6** · NAT · 2 marks. Two fair dice are thrown. Given that at least one die shows 3, find the probability that the sum is a prime number. (Round off to two decimal places)

**P2.H7** · NAT · 2 marks. Box A has 3 white and 2 black balls; box B has 2 white and 3 black. One ball is moved at random from A to B, and then a ball is drawn at random from B. Find the probability that it is white. (Round off to two decimal places)
