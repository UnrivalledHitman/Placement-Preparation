# Chapter 3: Functional Dependencies and Normalisation
%Closures, keys, minimal covers, normal forms 1NF to 5NF, and decompositions that lose neither data nor constraints

Normalisation questions appear in nearly every DBMS test: "find the candidate keys", "what is the highest normal form", "decompose into BCNF; is it dependency preserving?". Each of these is an algorithm, and this chapter implements every one so that you can check any textbook numerical. The MySQL guide covers normalisation *practically* (splitting real tables); here we do the theory.

Throughout, attributes are single capital letters and a relation such as `R(ABCDE)` means the attribute set {A, B, C, D, E}. A set of dependencies is written `A->BC, CD->E`.

## 3.1 Functional dependencies

A **functional dependency** (FD) X → Y holds on a relation R if any two tuples that agree on all attributes of X also agree on all attributes of Y. In words: X determines Y.

| Term | Meaning | Example |
|---|---|---|
| Trivial FD | Y ⊆ X; always holds | AB → A |
| Non-trivial | Y ⊄ X | A → B |
| Completely non-trivial | X ∩ Y = ∅ | A → BC |
| F<sup>+</sup> (closure of F) | Every FD implied by F | From A → B, B → C we get A → C |
| X<sup>+</sup> (attribute closure) | Every attribute determined by X under F | — |
| Superkey | X with X<sup>+</sup> = R | — |
| Candidate key | Minimal superkey | — |
| Prime attribute | Belongs to some candidate key | — |

Like keys, an FD is a constraint on every legal instance. An instance can *refute* an FD but never prove it.

## 3.2 Armstrong's axioms

Three rules generate every implied FD. They are **sound** (they never derive a false FD) and **complete** (they derive all of F<sup>+</sup>).

| Rule | Statement |
|---|---|
| Reflexivity | If Y ⊆ X then X → Y |
| Augmentation | If X → Y then XZ → YZ |
| Transitivity | If X → Y and Y → Z then X → Z |
| Union (derived) | If X → Y and X → Z then X → YZ |
| Decomposition (derived) | If X → YZ then X → Y and X → Z |
| Pseudo-transitivity (derived) | If X → Y and WY → Z then WX → Z |

Example derivation of pseudo-transitivity: from X → Y, augmentation with W gives WX → WY; with WY → Z, transitivity gives WX → Z.

> TRAP: There is no "left decomposition". From AB → C you **cannot** conclude A → C or B → C. Only the right-hand side may be split.

## 3.3 The toolkit: closures, keys and normal-form tests

Computing F<sup>+</sup> directly is exponential, so every practical question is answered with the **attribute closure** X<sup>+</sup> instead:

1. Start with result = X.
2. Repeat: for each FD L → R in F, if L ⊆ result, add R to result.
3. Stop when a full pass adds nothing.

X → Y is implied by F exactly when Y ⊆ X<sup>+</sup>. The program below is the toolkit used for the rest of the chapter. It saves itself as `fd.py` so that the later programs can import it; copy it for your own numericals.

```python run fd.py: closure, keys, covers, normal forms and decompositions
import sys, shutil
from itertools import combinations


def parse(text):
    """'A->BC, CD->E' -> list of (frozenset LHS, frozenset RHS)."""
    fds = []
    for part in text.replace(' ', '').split(','):
        lhs, rhs = part.split('->')
        fds.append((frozenset(lhs), frozenset(rhs)))
    return fds


def fmt(attrs):
    return ''.join(sorted(attrs))


def show(fds):
    return ', '.join(f'{fmt(l)}->{fmt(r)}' for l, r in fds)


def closure(x, fds, trace=False):
    result = set(x)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            if lhs <= result and not rhs <= result:
                result |= rhs
                changed = True
                if trace:
                    print(f'   use {fmt(lhs)}->{fmt(rhs)}: {fmt(result)}')
    return result


def candidate_keys(rel, fds):
    rel = set(rel)
    on_right = set().union(*(r - l for l, r in fds)) if fds else set()
    core = rel - on_right                  # never determined: must be in every key
    rest = sorted(rel - core)
    keys = []
    for k in range(len(rest) + 1):
        for extra in combinations(rest, k):
            cand = core | set(extra)
            if any(key <= cand for key in keys):
                continue                   # not minimal
            if closure(cand, fds) >= rel:
                keys.append(cand)
    return sorted(keys, key=lambda s: (len(s), fmt(s)))


def singleton_rhs(fds):
    return [(l, frozenset(a)) for l, r in fds for a in sorted(r)]


def minimal_cover(fds):
    g = list(dict.fromkeys(singleton_rhs(fds)))
    for i, (lhs, rhs) in enumerate(g):     # 1. remove extraneous left-hand attributes
        for a in sorted(lhs):
            smaller = lhs - {a}
            if smaller and rhs <= closure(smaller, g):
                lhs = smaller
        g[i] = (lhs, rhs)
    g = list(dict.fromkeys(g))
    for fd in list(g):                     # 2. remove redundant dependencies
        others = [x for x in g if x != fd]
        if fd[1] <= closure(fd[0], others):
            g = others
    return g


def project(rel, fds):
    """FDs that hold on a sub-schema: X -> (X+ restricted to rel) for every subset X."""
    rel = set(rel); out = []
    for k in range(1, len(rel)):
        for x in combinations(sorted(rel), k):
            rhs = (closure(x, fds) & rel) - set(x)
            if rhs:
                out.append((frozenset(x), frozenset(rhs)))
    return minimal_cover(out) if out else []


def normal_form(rel, fds):
    rel = set(rel)
    keys = candidate_keys(rel, fds)
    prime = set().union(*keys)
    cover = minimal_cover(fds)
    superkey = lambda x: closure(x, fds) >= rel
    for key in keys:                       # 2NF: no non-prime depends on part of a key
        for k in range(1, len(key)):
            for part in combinations(sorted(key), k):
                if (closure(part, fds) - set(part)) & (rel - prime):
                    return '1NF'
    if any(not superkey(l) and not (r <= prime) for l, r in cover):
        return '2NF'
    if any(not superkey(l) for l, r in cover if not r <= l):
        return '3NF'
    return 'BCNF'


def lossless(rel, parts, fds):
    """Chase test: build the tableau, apply FDs until a row becomes all-distinguished."""
    rel = sorted(rel)
    rows = [{a: ('a', a) if a in p else ('b', a, i) for a in rel} for i,
            p in enumerate(parts)]
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            groups = {}
            for row in rows:
                groups.setdefault(tuple(row[a] for a in sorted(lhs)), []).append(row)
            for grp in groups.values():
                for a in rhs:
                    vals = {row[a] for row in grp}
                    if len(vals) > 1:
                        best = ('a', a) if ('a', a) in vals else min(vals)
                        for row in grp:
                            if row[a] != best:
                                row[a] = best; changed = True
    return any(all(row[a] == ('a', a) for a in rel) for row in rows)


def preserves(parts, fds):
    """Dependency preservation without computing F+ (closure restricted to each part)."""
    lost = []
    for lhs, rhs in fds:
        result = set(lhs)
        changed = True
        while changed:
            changed = False
            for p in parts:
                add = closure(result & set(p), fds) & set(p)
                if not add <= result:
                    result |= add; changed = True
        if not rhs <= result:
            lost.append((lhs, rhs))
    return lost


def bcnf_decompose(rel, fds):
    todo, done = [set(rel)], []
    while todo:
        r = todo.pop(0)
        viol = next(((l, rr) for l, rr in project(r, fds)
                     if not closure(l, fds) >= r), None) if len(r) > 2 else None
        if viol is None:
            done.append(r); continue
        x = set(viol[0]); xplus = closure(x, fds) & r
        todo += [xplus, r - (xplus - x)]
    return done


def synthesis_3nf(rel, fds):
    cover = minimal_cover(fds)
    groups = {}
    for l, r in cover:
        groups.setdefault(l, set()).update(r)
    schemas = [set(l) | r for l, r in groups.items()]
    keys = candidate_keys(rel, fds)
    if not any(any(k <= s for k in keys) for s in schemas):
        schemas.append(set(keys[0]))
    return [s for s in schemas if not any(s < o for o in schemas)]


if __name__ == '__main__':
    shutil.copy(sys.argv[0], 'fd.py')       # save the toolkit for later programs
    F = parse('A->BC, CD->E, B->D, E->A')
    print('F =', show(F))
    print('closure of A with a trace:')
    print('A+ =', fmt(closure('A', F, trace=True)))
    for x in ['B', 'BC', 'CD', 'E']:
        print(f'{x}+ = {fmt(closure(x, F))}')
```

The trace shows the closure growing one FD at a time: A → BC adds B and C, B → D adds D, then CD → E adds E, so A<sup>+</sup> = ABCDE and A is a key. B<sup>+</sup> = BD is not.

## 3.4 Finding all candidate keys

Testing every subset of attributes is exponential, but a simple observation prunes it hard. Classify each attribute by where it appears in F:

| Appears | Consequence |
|---|---|
| Only on the left (or nowhere) | Nothing determines it, so it is in **every** candidate key (the *core*) |
| Only on the right | Never needed in a key |
| On both sides | May or may not be in a key: try them |

The toolkit's `candidate_keys` starts from the core and adds attributes in increasing number, skipping any set that already contains a smaller key. Here it is on three standard problems:

```python run Candidate keys, prime attributes and the highest normal form
from fd import *
problems = [
    ('ABCDE', 'A->BC, CD->E, B->D, E->A'),
    ('ABCDEF', 'AB->C, C->D, D->E, E->F, F->B'),
    ('ABCD', 'AB->C, A->D'),
    ('ABC', 'AB->C, C->B'),
    ('ABCDEFGHIJ', 'AB->C, A->DE, B->F, F->GH, D->IJ'),
]
for rel, text in problems:
    F = parse(text)
    keys = candidate_keys(rel, F)
    prime = fmt(set().union(*keys))
    print(f'R({rel}) F: {text}')
    print(f'   keys {[fmt(k) for k in keys]}, prime {prime}, highest NF '
            f'{normal_form(rel, F)}')
```

Walk through the second problem by hand. A appears only on the left, so it is in every key. A<sup>+</sup> = A, so A alone is not a key. Try adding one of the both-side attributes: AB<sup>+</sup> = ABCDEF (AB → C → D → E → F, and B is there already), so AB is a key. Since F → B, any attribute that leads to F also works: AF, AE, AD and AC are keys too. The last problem is a classic textbook question: only AB is a key, and A → DE makes it 1NF.

## 3.5 Equivalence and minimal (canonical) covers

Two sets of FDs F and G are **equivalent** if each implies every FD of the other (check with closures). A **minimal cover** of F is an equivalent set where:

1. Every right-hand side is a single attribute.
2. No left-hand side has an extraneous attribute (removing it would lose an FD).
3. No FD is redundant (removable without changing F<sup>+</sup>).

The order of the steps matters: remove extraneous left attributes **before** removing redundant FDs. A minimal cover is not unique; different processing orders can give different, equally valid covers.

```python run Minimal covers and equivalence
from fd import *
F = parse('A->BC, B->C, A->B, AB->C')
print('F             :', show(F))
print('minimal cover :', show(minimal_cover(F)))

G = parse('AB->C, C->A, BC->D, ACD->B, D->EG, BE->C, CG->BD, CE->AG')
print('G             :', show(G))
M = minimal_cover(G)
print('minimal cover :', show(M), f'({len(M)} FDs)')

def implies(f, g):
    return all(r <= closure(l, f) for l, r in g)

print('cover equivalent to G?', implies(M, G) and implies(G, M))
H = parse('A->B, B->C')
print('F equivalent to {A->B, B->C}?', implies(F, H) and implies(H, F))
```

In F, A → C is implied by A → B and B → C, and AB → C has the extraneous attribute A (B → C already holds), so the cover is A → B, B → C. The second set is Ullman's classic example; textbooks show more than one minimal cover for it, and any cover the algorithm produces is correct as long as it is equivalent to the original.

## 3.6 Normal forms

| Normal form | Condition (for every non-trivial FD X → A in a cover) | Removes |
|---|---|---|
| 1NF | All attribute values atomic (no lists, no repeating groups) | Multivalued cells |
| 2NF | 1NF, and no non-prime attribute depends on a **proper part** of a candidate key | Partial dependencies |
| 3NF | X is a superkey **or** A is prime | Transitive dependencies of non-prime attributes |
| BCNF | X is a superkey | Every redundancy caused by FDs |
| 4NF | BCNF, and for every non-trivial MVD X →→ Y, X is a superkey | Redundancy from independent multivalued facts |
| 5NF (PJNF) | Every join dependency is implied by the candidate keys | Redundancy that only a 3-way (or more) split removes |

Each form implies the previous ones: BCNF ⇒ 3NF ⇒ 2NF ⇒ 1NF. Also useful:

- If every candidate key is a **single attribute**, a 1NF relation is automatically in 2NF (no proper part of a key exists).
- If **every** attribute is prime, the relation is automatically in 3NF.
- A relation with only **two** attributes is always in BCNF.

> TRAP: For 2NF and 3NF the test is about **non-prime** attributes. `R(ABC)` with AB → C and C → B has C → B where C is not a superkey, but B is prime, so R is in 3NF and fails only BCNF.

## 3.7 Properties of a decomposition

Decomposing R into R1, …, Rn must not break two things:

| Property | Meaning | Test |
|---|---|---|
| Lossless join | Natural join of the parts gives back exactly R: no lost, no spurious tuples | Two parts: R1 ∩ R2 → R1 or R1 ∩ R2 → R2. General: the chase |
| Dependency preserving | Every FD of F can be checked inside a single part, without joins | (F1 ∪ … ∪ Fn)<sup>+</sup> = F<sup>+</sup>, tested with restricted closures |

Losslessness is **mandatory**; dependency preservation is desirable. The program below shows a lossy split on a real instance (spurious tuples appear), runs the chase on Ullman's five-way decomposition, and checks dependency preservation.

```python run Lossless joins and dependency preservation
from fd import *
rows = [('Asha', 'CSE', 'Kolkata'), ('Ravi', 'CSE', 'Pune')]       # R(name, dept, city)
R1 = {(n, d) for n, d, c in rows}                                     # (name, dept)
R2 = {(d, c) for n, d, c in rows}                                     # (dept, city)
joined = {(n, d, c) for n, d in R1 for d2, c in R2 if d == d2}
print('original rows :', len(rows), '| after joining (name,dept) with (dept,city):',
        len(joined))
print('spurious      :', sorted(joined - set(rows)))

F = parse('A->C, B->C, C->D, DE->C, CE->A')
parts = ['AD', 'AB', 'BE', 'CDE', 'AE']
print('Ullman decomposition', parts, 'lossless?', lossless('ABCDE', parts, F))
print('split into AB, BC with only A->B lossless?', lossless('ABC', ['AB', 'BC'],
        parse('A->B')))
print('split into AB, AC with A->B lossless?    ', lossless('ABC', ['AB', 'AC'],
        parse('A->B')))

G = parse('A->B, B->C, C->D')
for p in (['AB', 'BC', 'CD'], ['AB', 'AC', 'AD'], ['ABC', 'CD']):
    lost = preserves(p, G)
    print(f'{p} preserves A->B, B->C, C->D?', 'yes' if not lost else 'no, loses '
            + show(lost))
```

In the first split, `dept` is the only common attribute and it is not a key of either part, so two people in CSE create two spurious rows. `AB, AC` is lossless because the common attribute A determines B (A → AB). `AB, AC, AD` is lossless too but cannot check B → C or C → D inside any single table.

## 3.8 Decomposition algorithms

### 3NF synthesis (Bernstein)

1. Compute a minimal cover.
2. For each left-hand side X, create a schema X ∪ (everything X determines in the cover).
3. If no schema contains a candidate key, add one schema that is a key.
4. Remove any schema contained in another.

The result is **always lossless and dependency preserving** and every part is in 3NF.

### BCNF decomposition

1. If some part Ri has an FD X → Y (holding on Ri) where X is not a superkey of Ri, replace Ri with X<sup>+</sup> ∩ Ri and Ri − (X<sup>+</sup> − X).
2. Repeat until every part is in BCNF.

The result is **always lossless**, but **may not preserve dependencies**. This trade-off is the reason 3NF still exists.

```python run 3NF synthesis versus BCNF decomposition
from fd import *
cases = [
    ('ABCD', 'AB->C, A->D'),
    ('ABCDE', 'A->B, B->C, CD->E'),
    ('ABC', 'AB->C, C->B'),
]
for rel, text in cases:
    F = parse(text)
    print(f'R({rel}) F: {text}  (highest NF {normal_form(rel, F)})')
    for name, parts in [('3NF ', synthesis_3nf(rel, F)), ('BCNF', bcnf_decompose(rel, F))]:
        ps = sorted(fmt(p) for p in parts)
        lost = preserves(ps, F)
        nfs = [normal_form(p, project(p, F)) for p in ps]
        print(f'   {name}: {ps} parts in {nfs} lossless {lossless(rel, ps, F)} '
              f'preserving {"yes" if not lost else "no, loses " + show(lost)}')
```

The second case shows that the BCNF algorithm's result depends on which violation it fixes first. Splitting on A → B, then B → C, leaves C and D in different tables, so CD → E is lost, even though the 3NF answer (which happens to be all BCNF parts) keeps it. When BCNF decomposition loses a dependency, try fixing the violations in a different order before giving up. The third case is the classic counterexample: `R(student, course, instructor)` with "a student takes a course from one instructor" (AB → C) and "each instructor teaches one course" (C → B). It is in 3NF, BCNF requires splitting it, and no BCNF decomposition can check AB → C without a join.

> TIP: In an interview, say: "BCNF removes all FD redundancy but may lose dependency preservation; 3NF always keeps both lossless join and dependency preservation, at the cost of a little redundancy. In practice, aim for 3NF/BCNF and denormalise deliberately for read performance."

## 3.9 Multivalued dependencies, 4NF and 5NF

A **multivalued dependency** X →→ Y holds when, for each X value, the set of Y values is independent of the remaining attributes. The textbook case is a course with a set of teachers and, independently, a set of books. Storing them in one table forces every combination of teacher and book to appear.

Every FD is also an MVD (X → Y implies X →→ Y), and MVDs come in complementary pairs: if X →→ Y then X →→ (R − X − Y). A relation is in **4NF** if, for every non-trivial MVD X →→ Y, X is a superkey. The fix is to split into (X, Y) and (X, R − X − Y), which is lossless exactly when the MVD holds.

```python run An MVD on a real instance, and the 4NF split
from itertools import product
CTB = {(c, t, b) for c, ts, bs in [('DBMS', ['Sen', 'Roy'], ['Korth', 'Navathe', 'Date']),
                                   ('OS', ['Das'], ['Galvin', 'Tanenbaum'])]
       for t, b in product(ts, bs)}

def holds_mvd(rows):          # course ->> teacher on (course, teacher, book)
    for c1, t1, b1 in rows:
        for c2, t2, b2 in rows:
            if c1 == c2 and (c1, t1, b2) not in rows:
                return False
    return True

CT = {(c, t) for c, t, b in CTB}
CB = {(c, b) for c, t, b in CTB}
rejoined = {(c, t, b) for c, t in CT for c2, b in CB if c == c2}
print('rows in CTB:', len(CTB), '| course ->> teacher holds:', holds_mvd(CTB))
print('4NF split: CT has', len(CT), 'rows, CB has', len(CB), 'rows; rejoin equal:',
        rejoined == CTB)
CTB.add(('DBMS', 'Mitra', 'Korth'))                  # add a teacher for one book only
print('after adding one row without its partners, MVD holds:', holds_mvd(CTB))
```

Adding the new DBMS teacher needs **three** rows in CTB (one per book), but one row in CT. That is the redundancy 4NF removes.

**5NF** handles the rarest case: a relation that cannot be split into two parts losslessly but can be split into three. The cyclic supplier–part–project rule "if supplier s supplies part p, and part p is used in project j, and supplier s supplies project j, then s supplies p to j" creates such a **join dependency**.

```python run 5NF: lossless in three parts, lossy in two
SPJ = {('s1', 'p1', 'j2'), ('s1', 'p2', 'j1'), ('s2', 'p1', 'j1'), ('s1', 'p1', 'j1')}
SP = {(s, p) for s, p, j in SPJ}
PJ = {(p, j) for s, p, j in SPJ}
JS = {(j, s) for s, p, j in SPJ}
two = {(s, p, j) for s, p in SP for p2, j in PJ if p == p2}
three = {(s, p, j) for s, p, j in two if (j, s) in JS}
print('SP join PJ          :', len(two), 'rows, spurious', sorted(two - SPJ))
print('SP join PJ join JS  :', len(three), 'rows, equal to SPJ:', three == SPJ)
```

## 3.10 Denormalisation and practical lessons

Normalisation optimises for **correct updates**: each fact stored once. Real systems sometimes **denormalise** for read speed: store `order_total` in `orders`, keep a `follower_count` column, or build a reporting table. The cost is that every write must keep the copies consistent (triggers, application code, or eventual consistency). Analytics warehouses use star schemas with deliberately denormalised dimension tables.

- To find keys: compute the core (left-only attributes), then grow it, testing closures.
- To find the highest NF: find keys and prime attributes first, then check 2NF (partial), 3NF (prime or superkey), BCNF (superkey).
- Minimal cover order: split right sides, remove extraneous left attributes, then remove redundant FDs.
- Binary decomposition is lossless if the common attributes are a key of one side.
- 3NF synthesis: always lossless and preserving. BCNF: always lossless, maybe not preserving.
- 4NF is about independent multivalued facts; 5NF about cyclic join dependencies. Both are rare in practice but common in viva questions.
