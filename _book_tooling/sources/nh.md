# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| N1.1 | Both vectors have length 5; the projection is ((**u** · **v**)/(**u** · **u**))**u** |
| N1.2 | Multiply (**AB**)(**B**<sup>−1</sup>**A**<sup>−1</sup>) and regroup; transpose **AA**<sup>−1</sup> = **I** |
| N1.3 | Write (1, 0) = ½(1, 1) + ½(1, −1); each piece is an eigenvector |
| N1.4 | For **A**<sup>T</sup>**Av** = λ**v**, compute **v**<sup>T</sup>**A**<sup>T</sup>**Av** two ways |
| N1.5 | Centre first; the squared error of dropping component 3 is ‖**X**<sub>c</sub>**v**<sub>3</sub>‖² = σ<sub>3</sub>² |
| N1.6 | Two equal columns make **X**<sup>T</sup>**X** singular; think ridge, or drop the copy |
| N1.7 | Write trace(**AB**) = Σ<sub>i</sub>Σ<sub>j</sub>A<sub>ij</sub>B<sub>ji</sub> and swap the sums |

## Part 2 hints

| Exercise | Hint |
|---|---|
| N2.1 | tanh = (e<sup>x</sup> − e<sup>−x</sup>)/(e<sup>x</sup> + e<sup>−x</sup>); use the quotient rule |
| N2.2 | d/dt ln(1 + e<sup>−t</sup>) = −σ(−t) |
| N2.3 | The penalty contributes 2λ**w** |
| N2.4 | Solve 3x² = 3y and 3y² = 3x together |
| N2.5 | Correct gradient: **p** − **y**; buggy: **p** |
| N2.6 | Chain rule: diag(σ′) times **W** |

## Part 3 hints

| Exercise | Hint |
|---|---|
| N3.1 | Each bias entry is added to every row of **Z** |
| N3.2 | Squared error: 2(p − 1)p(1 − p); cross-entropy: p − 1 |
| N3.3 | Output gradient for MSE over a batch of B: 2(ŷ − y)/B; tanh′ = 1 − h² |
| N3.4 | Write the update with 2λ**w** inside and factor **w** out |
| N3.5 | 2/768 and 2/512 |

## Part 4 hints

| Exercise | Hint |
|---|---|
| N4.1 | η < 2/λ<sub>max</sub>; η<sub>opt</sub> = 2/(λ<sub>max</sub> + λ<sub>min</sub>) |
| N4.2 | ∇f = **Aw** − **b** and **H** = **A** |
| N4.3 | Try the chord between (1, 1) and (−1, −1) |
| N4.4 | Near the valley floor the Hessian's eigenvalues differ by a factor of about 2,500 |
| N4.5 | Stationarity gives **Cw** = λ**w** |
| N4.6 | m<sub>t</sub> = 1 − β<sup>t</sup> for a constant gradient 1 |

## Part 5 hints

| Exercise | Hint |
|---|---|
| N5.1 | Count outcomes: 11 contain a six |
| N5.2 | 0.2 × 0.6 versus 0.8 × 0.05 |
| N5.3 | Var(mean) = (1/n²)(Σ Var + Σ<sub>i≠j</sub> Cov) |
| N5.4 | (b) Condition on the first one or two tosses and solve for E |
| N5.5 | P(T > t) = e<sup>−λt</sup> |
| N5.6 | SE = √(p(1 − p)/n) |
| N5.7 | Var(X<sub>1</sub> ± X<sub>2</sub>) = Σ<sub>11</sub> + Σ<sub>22</sub> ± 2Σ<sub>12</sub> |

## Part 6 hints

| Exercise | Hint |
|---|---|
| N6.1 | ln p(x) = ln p + (x − 1) ln(1 − p) |
| N6.2 | P(max ≤ t) = (t/θ)<sup>n</sup>; differentiate for the density |
| N6.3 | Minimise Σ(x<sub>i</sub> − μ)²/(2σ²) + μ²/(2τ²) |
| N6.4 | Posterior Beta(1 + 3, 1 + 7) |
| N6.5 | MSE(c) = (c − 1)²μ² + c²σ²/n |
| N6.6 | A word unseen in one class gives probability 0 to the whole product |

## Part 7 hints

| Exercise | Hint |
|---|---|
| N7.1 | t<sub>0.975, 15</sub> ≈ 2.131 |
| N7.2 | Pooled rate 450/8,000 |
| N7.3 | n ≈ (z<sub>0.975</sub> + z<sub>0.8</sub>)²(p<sub>1</sub>q<sub>1</sub> + p<sub>2</sub>q<sub>2</sub>)/δ² |
| N7.4 | Each look is another chance for a false positive |
| N7.5 | The paired test works on the differences, which cancel the shared difficulty |
| N7.6 | A p-value is computed assuming H<sub>0</sub> is true |

## Part 8 hints

| Exercise | Hint |
|---|---|
| N8.1 | H(P) = 1.5 bits; H(P, Q) = log<sub>2</sub> 3 |
| N8.2 | Average −ln p, then exponentiate |
| N8.3 | Differentiate −p ln q − (1 − p) ln(1 − q) |
| N8.4 | The intercept equation forces the line through (x̄, ȳ) |
| N8.5 | Substitute **X** = **UΣV**<sup>T</sup> into (**X**<sup>T</sup>**X** + λ**I**)<sup>−1</sup>**X**<sup>T</sup>**y** |
| N8.6 | The old solution is still available with the new coefficient set to 0 |
