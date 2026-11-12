# How to use this guide
%The paper, what it rewards, a study plan to February 2028, and the habits that win marks

This is Volume 1 of a GATE Data Science and Artificial Intelligence (DA) course. It covers the three mathematics sections of the syllabus: probability and statistics, linear algebra, and calculus and optimisation. Volume 2 covers programming and algorithms, databases and warehousing, machine learning and AI. Each chapter teaches one block of the official syllabus, works through examples of the kind GATE asks, and ends with the traps that cost marks. Every worked number in the book was computed by a program, so you can trust the answers while you check your own working.

The practice books follow the same order. After each chapter, solve the Easy tier of the matching set, then Medium. Leave the Hard tier for a second pass.

## The paper

| Feature | Detail |
|---|---|
| Duration | 3 hours, computer-based, with an on-screen virtual calculator |
| Questions and marks | 65 questions for 100 marks: General Aptitude 10 questions (15 marks), DA subject 55 questions (85 marks) |
| One-mark questions | Q1–5 (aptitude) and Q11–35 (subject) |
| Two-mark questions | Q6–10 (aptitude) and Q36–65 (subject) |
| MCQ | One correct option out of four; **negative marking**: −1/3 for a one-mark question, −2/3 for a two-mark question |
| MSQ | Multiple select: one or more options are correct; you must pick **exactly** the correct set; no partial marks, no negative marks |
| NAT | Numerical answer typed in; must fall inside the published range; no negative marks |

## What the 2025 and 2026 papers tested

The table classifies all 110 subject questions of the two most recent papers by syllabus section. Probability and statistics alone carried 19 of the 85 subject marks in both years, more than any other section. The three mathematics sections together carried about 40%.

| Section | 2025 marks | 2026 marks | Average | Share of 85 |
|---|---|---|---|---|
| Probability and statistics | 19 | 19 | 19.0 | 22% |
| Linear algebra | 12 | 8 | 10.0 | 12% |
| Calculus and optimisation | 9 | 4 | 6.5 | 8% |
| Programming, data structures and algorithms | 14 | 14 | 14.0 | 16% |
| Databases and warehousing | 11 | 18 | 14.5 | 17% |
| Machine learning | 14 | 14 | 14.0 | 16% |
| Artificial intelligence | 6 | 8 | 7.0 | 8% |

The question types were similar in both years:

| Type | 2025 (1 mark + 2 marks) | 2026 (1 mark + 2 marks) |
|---|---|---|
| MCQ | 13 + 12 | 12 + 11 |
| MSQ | 7 + 11 | 6 + 8 |
| NAT | 5 + 7 | 7 + 11 |

Two lessons follow. First, MSQ and NAT questions, which carry no negative marks, were close to half of the subject paper. Leave none of them blank. Second, mathematics appears inside other sections too: the 2025 paper asked for a principal-component variance, a least-squares slope and a naive Bayes error probability, which are linear algebra and probability dressed as machine learning.

## Topics the mathematics sections asked about

This index lists the ideas behind each mathematics question in the 2025 and 2026 papers (paraphrased, not copied). Use it to see what "GATE level" means for each chapter. Practise the official papers, which the organising institutes publish with answer keys, alongside this book.

| Chapter | Ideas tested in 2025 and 2026 |
|---|---|
| 1 Counting and probability | Bayes with boxes of balls; a diagnostic test (posterior after a positive result); "at least one" with 100 dice; random subsets with an even product; non-negative integer solutions (stars and bars); counting involutions on a 4-element set |
| 2 Random variables | E[E[X \| Y]]; median from a piecewise CDF; P(X² ≤ c) from a CDF; mean and variance of a sample proportion; covariance when Y depends on X; variance of a function of two independent variables; mean and variance identities for a dataset; properties of a discrete CDF |
| 3 Distributions | Exponential rate from a tail probability; memorylessness; floor of an exponential is geometric; a normal written as aZ + b; variance of Z²; comparing a standard normal with a t density; expected count with replacement; a binomial row and column sum |
| 4 Inference | CLT for a sum of 300 Bernoulli variables; chi-square from sums of squared normals and the sample variance |
| 5 Linear algebra I | Cost of Gaussian elimination on a triangular matrix; null space of a polynomial in A when rows sum to 1; orthonormal bases; area of a sphere's cross-section by a plane through the origin |
| 6 Linear algebra II | I + xxᵀ; A³ = A; a Gram matrix of independent vectors; sums of outer products of orthonormal vectors; norm-preserving matrices; eigenvalues of a rotation block; the centring matrix and its quadratic form; a matrix whose square is the identity |
| 7 Calculus | The tenth derivative of sinh at 0; differentiability of compositions and products; a limit at infinity; maxima and minima of a cubic on an interval; convex functions; \|f(x) − f(y)\| ≤ (x − y)² forcing a constant; a double geometric series; a limit of a series sum |

## A plan to GATE 2028

GATE 2028 will be held in February 2028, and registration usually opens in late August and closes in early October 2027. **Mark both dates now**: missing the registration window means waiting another year.

| Period | Focus | Daily time |
|---|---|---|
| Dec 2026 – Feb 2027 | Placements and the 12-week DSA + SQL plan come first. One hour on weekends: Chapter 1 of this guide and General Aptitude | Weekends only |
| Mar – May 2027 | Volume 1: probability and statistics (8 weeks), linear algebra (6 weeks), calculus (3 weeks). Easy and Medium tiers of every set | 1.5–2 hours |
| Jun – Sep 2027 | Volume 2: Python and DSA (quick, since your placement prep covers it), databases, machine learning, AI. Easy and Medium tiers. **Register in September** | 1.5–2 hours |
| Oct – Dec 2027 | Hard tiers of every set; the official 2024–2027 papers under time pressure; one General Aptitude set a week | 2 hours |
| Jan 2028 | The three mock papers, one a week, analysed in full; the quick revision book twice | 2–3 hours |

If you start work in mid-2027, keep the plan but move the Hard tiers to weekends. Consistency matters more than daily volume.

## Habits that win marks

1. **Read the question type before solving.** An MSQ needs every option checked. Students often stop after finding one correct option and lose the whole question.
2. **Guess MCQs only with reason.** With four options and −1/3 per wrong one-mark answer, a blind guess has an expected value of 1/4 − (3/4)(1/3) = 0. Eliminate even one option and the guess becomes worth taking.
3. **Never leave an MSQ or NAT blank.** They carry no negative marks.
4. **Round NAT answers as instructed,** and only at the end. Carry four or more significant figures through the calculation.
5. **Practise with a basic calculator.** The exam's virtual calculator is slow to use with a mouse. The questions are designed so that clever working beats brute arithmetic, and this book's solutions show the short route.
6. **Budget time.** About 1.5 minutes per one-mark and 3 minutes per two-mark question leaves 20 minutes to review. Skip anything that takes twice its budget and return later.

## How each chapter is organised

Each chapter starts with the definitions and results you must know, followed by worked examples in GATE style (some marked MSQ or NAT). Programs compute every numerical answer; you will never need code in the exam, but reading the check is a good way to confirm your understanding. Each chapter ends with a table of traps.
