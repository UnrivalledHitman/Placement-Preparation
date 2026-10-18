## Set B3: Normalisation and indexing

### Easy

**B3.E1** · MCQ · 1 mark. In R(A, B, C, D) with A → B and B → C, the closure A⁺ is (A) AB (B) ABC (C) ABCD (D) A

**B3.E2** · NAT · 1 mark. How many candidate keys does R(A, B, C) have, with A → B, B → C and C → A?

**B3.E3** · MCQ · 1 mark. Moving from 1NF to 2NF removes (A) transitive dependencies (B) multi-valued dependencies (C) partial dependencies on a candidate key (D) join dependencies

**B3.E4** · NAT · 1 mark. A B+ tree non-leaf node fits in a 1024-byte block. Keys take 12 bytes and child pointers 4 bytes. What is the maximum number of child pointers per node?

**B3.E5** · MSQ · 1 mark. Which statements are always true? (A) Every 3NF relation is in BCNF (B) A lossless, dependency-preserving 3NF decomposition always exists (C) Every BCNF relation is in 3NF (D) Every relation with two attributes is in BCNF

**B3.E6** · NAT · 1 mark. A dense secondary index is built on a file of 5000 records with distinct values of the indexed attribute. How many index entries does it have?

**B3.E7** · MCQ · 1 mark. Which kind of index must be dense? (A) A primary index (B) A secondary index (C) A clustering index (D) Any index on a sorted file

**B3.E8** · MSQ · 1 mark. R(A, B, C) has the single FD A → B. Which decompositions are lossless? (A) R₁(A, B), R₂(C) (B) R₁(A, C), R₂(B, C) (C) R₁(A, B), R₂(B, C) (D) R₁(A, B), R₂(A, C)

### Medium

**B3.M1** · NAT · 2 marks. How many candidate keys does R(A, B, C, D, E) have with AB → C, C → D, D → E and E → A?

**B3.M2** · MCQ · 2 marks. R(A, B, C, D) has candidate key AB and the FDs AB → C and B → D. Its highest normal form is (A) 2NF (B) 1NF (C) 3NF (D) BCNF

**B3.M3** · MSQ · 2 marks. R(A, B, C) has the FDs AB → C and C → B. Which statements are correct? (A) AC is a candidate key (B) R is in BCNF (C) R is in 3NF (D) AB is a candidate key

**B3.M4** · NAT · 2 marks. A B+ tree leaf fits in a 2048-byte block, holding keys of 10 bytes, record pointers of 6 bytes and one 6-byte pointer to the next leaf. What is the maximum number of keys per leaf?

**B3.M5** · MCQ · 2 marks. R(A, B, C, D) with A → B and C → D is decomposed into (A, B) and (C, D). The decomposition is (A) lossless and dependency preserving (B) neither lossless nor dependency preserving (C) lossless but not dependency preserving (D) lossy but dependency preserving

**B3.M6** · NAT · 2 marks. A B+ tree has leaves holding 100 keys each and internal nodes with 100 children each, all full. How many levels (including the leaf level) are needed for 1,000,000 keys?

**B3.M7** · MSQ · 2 marks. Which statements about indexes are correct? (A) In a B+ tree, record pointers appear only in the leaves (B) A hash index answers equality searches in O(1) expected time (C) A hash index answers range queries efficiently (D) B+ tree internal nodes hold the record pointers

**B3.M8** · MCQ · 2 marks. From A → B and BC → D, Armstrong's axioms derive (A) AC → D (B) A → D (C) C → D (D) B → D

**B3.M9** · NAT · 2 marks. How many FDs does a minimal cover of {A → BC, B → C, A → B, AB → C} contain?

### Hard

**B3.H1** · NAT · 2 marks. How many candidate keys does R(A, B, C, D, E, F) have with A → B, B → C, C → A, D → E, E → F and F → D?

**B3.H2** · MCQ · 2 marks. R(A, B, C, D) has the FDs AB → C, C → D and D → A. Then R is (A) in 2NF but not 3NF (B) in BCNF (C) in 3NF but not BCNF (D) in 1NF but not 2NF

**B3.H3** · MSQ · 2 marks. R(A, B, C) with A → B and B → C is decomposed into (A, B) and (B, C). Which statements are correct? (A) Both pieces are in BCNF (B) It preserves dependencies (C) The decomposition is lossless (D) R itself is in BCNF

**B3.H4** · NAT · 2 marks. A B+ tree allows at most 2 keys per leaf and at most 3 children per internal node. What is the minimum number of levels (including the leaf level) needed to store 20 keys?

**B3.H5** · MCQ · 2 marks. A non-leaf B+ tree node fits in a 4096-byte block, with 16-byte keys and 8-byte child pointers. The maximum number of child pointers is (A) 170 (B) 172 (C) 171 (D) 256

**B3.H6** · NAT · 2 marks. R(A, B, C, D) has the FDs A → B, B → A and AC → D. How many superkeys does it have?

**B3.H7** · MSQ · 2 marks. Which statements about the 3NF synthesis algorithm are correct? (A) It starts from a minimal cover (B) It never needs to add an extra relation (C) Every relation it produces is in BCNF (D) It produces a lossless, dependency-preserving decomposition

## Set B4: Warehousing and data transformation

### Easy

**B4.E1** · MCQ · 1 mark. A star schema consists of (A) a single flat table with no keys (B) normalised dimension tables only (C) several unrelated fact tables (D) one fact table joined to denormalised dimension tables

**B4.E2** · NAT · 1 mark. How many cuboids does a data cube with 4 dimensions and no concept hierarchies have?

**B4.E3** · MCQ · 1 mark. Aggregating monthly sales into quarterly sales is (A) a slice (B) a drill-down (C) a roll-up (D) a pivot

**B4.E4** · NAT · 1 mark. Min–max normalise the value 30 to [0, 1], given minimum 10 and maximum 60. (Round off to one decimal place)

**B4.E5** · MSQ · 1 mark. Which measures are distributive? (A) AVG (B) SUM (C) COUNT (D) MAX

**B4.E6** · NAT · 1 mark. How many groupings does GROUP BY ROLLUP(A, B, C) produce?

**B4.E7** · MCQ · 1 mark. Selecting only the year 2025 from a (product, region, year) cube is (A) a roll-up (B) a dice (C) a slice (D) a drill-down

**B4.E8** · MSQ · 1 mark. Which are OLAP operations? (A) Sampling (B) Min–max normalisation (C) Dice (D) Roll-up

### Medium

**B4.M1** · NAT · 2 marks. A fact table has 3 regions and 4 products with every combination present. How many rows does GROUP BY CUBE(region, product) return?

**B4.M2** · MCQ · 2 marks. Time has the levels day < month < year, location has city < country, and product has a single level. How many cuboids are there? (A) 12 (B) 8 (C) 24 (D) 6

**B4.M3** · MSQ · 2 marks. Which measures are holistic? (A) Standard deviation (B) Average (C) Mode (D) Median

**B4.M4** · NAT · 2 marks. Standardise the value 90 in the data 50, 60, 70, 80, 90, using the population standard deviation. (Round off to two decimal places)

**B4.M5** · MCQ · 2 marks. A snowflake schema differs from a star schema in that (A) it has no fact table (B) its dimension tables are normalised (C) its fact table is normalised into several tables (D) it stores no measures

**B4.M6** · NAT · 2 marks. The values 4, 8, 15, 21, 21, 24, 25, 28, 34 are split into 3 equal-width bins. How many values fall in the last bin?

**B4.M7** · MSQ · 2 marks. Attribute A has 3 values and B has 2, with all combinations present. Which statements are correct? (A) GROUP BY CUBE(A, B) returns 12 rows (B) CUBE(A, B) has 3 groupings (C) The CUBE result includes a grand-total row (D) GROUP BY ROLLUP(A, B) returns 12 rows

**B4.M8** · MCQ · 2 marks. Decimal scaling is applied to data whose largest absolute value is 986. The smallest j such that every scaled value v/10ʲ has absolute value below 1 is (A) 3 (B) 2 (C) 4 (D) 1

**B4.M9** · NAT · 2 marks. Smoothing by bin means replaces each value in the bin {4, 8, 15} by what value?

### Hard

**B4.H1** · NAT · 2 marks. Dimensions D1, D2 and D3 have 2, 3 and 4 distinct values, with every combination present. How many rows does GROUP BY CUBE(D1, D2, D3) return?

**B4.H2** · MCQ · 2 marks. Each of three dimensions has a hierarchy of 2 levels (plus "all"). How many cuboids are there? (A) 8 (B) 27 (C) 64 (D) 9

**B4.H3** · MSQ · 2 marks. Only the (region, product) cuboid is stored. Which measures for the (region) cuboid can be computed from it exactly? (A) MEDIAN of sales (B) SUM of sales (C) AVG of sales, if only the group averages are stored (D) MODE of sales

**B4.H4** · NAT · 2 marks. A time dimension has 2 years, each with 4 quarters, each with 3 months (months are distinct across quarters). Every month has data. How many rows does GROUP BY ROLLUP(year, quarter, month) return?

**B4.H5** · MCQ · 2 marks. A daily sales fact table covers 100 stores, 365 days and 50 products, and 20% of all combinations have sales. How many rows does it have? (A) 365,000 (B) 1,825,000 (C) 73,000 (D) 36,500

**B4.H6** · NAT · 2 marks. Min–max normalise the value 40 to the range [−1, 1], given minimum 20 and maximum 120. (Round off to one decimal place)

**B4.H7** · MSQ · 2 marks. Which statements about sampling are correct? (A) Cluster sampling selects whole groups (B) Sampling reduces the volume of data to process (C) Simple random sampling without replacement can select the same record twice (D) Stratified sampling preserves the proportions of each stratum

# Machine learning

## Set M1: Regression, bias–variance, validation and metrics

### Easy

**M1.E1** · MCQ · 1 mark. Ordinary least squares chooses the coefficients that minimise (A) the sum of absolute residuals (B) the sum of squared residuals (C) the largest residual (D) the number of misclassified points

**M1.E2** · NAT · 1 mark. Fit y = wx (through the origin) to the points (1, 3) and (2, 5) by least squares. Find w. (Round off to one decimal place)

**M1.E3** · MCQ · 1 mark. Leave-one-out cross-validation on 500 training samples creates how many train/validation splits? (A) 500 (B) 499 (C) 1 (D) 250

**M1.E4** · NAT · 1 mark. A classifier has TP = 40, TN = 45, FP = 5 and FN = 10. Find its accuracy. (Round off to two decimal places)

**M1.E5** · MSQ · 1 mark. Which statements about ridge regression are correct? (A) It shrinks the coefficients (B) It sets some coefficients exactly to zero (C) It adds an L2 penalty on the coefficients (D) It increases the variance of the estimates

**M1.E6** · NAT · 1 mark. With TP = 40 and FP = 5, find the precision. (Round off to two decimal places)

**M1.E7** · MCQ · 1 mark. A model has very high training accuracy and much lower test accuracy. It most likely suffers from (A) irreducible noise only (B) underfitting (high bias) (C) overfitting (high variance) (D) data leakage into training

**M1.E8** · NAT · 1 mark. A regression has residual sum of squares 20 and total sum of squares 80. Find R². (Round off to two decimal places)

### Medium

**M1.M1** · NAT · 2 marks. Fit y = β₀ + β₁x to (1, 2), (2, 3), (3, 6) and (4, 7) by least squares. Find β₁. (Round off to one decimal place)

**M1.M2** · MCQ · 2 marks. For the fit of M1.M1, the intercept β₀ is (A) 0 (B) 0.5 (C) −0.5 (D) 1

**M1.M3** · MSQ · 2 marks. The ridge penalty λ is increased. Which statements are correct? (A) The coefficients grow in magnitude (B) The training error tends to decrease (C) The variance tends to decrease (D) The bias tends to increase

**M1.M4** · NAT · 2 marks. A classifier has precision 0.8 and recall 0.5. Find its F1 score. (Round off to two decimal places)

**M1.M5** · MCQ · 2 marks. In 5-fold cross-validation on 100 samples, each model is trained on (A) 20 samples (B) 80 samples (C) 100 samples (D) 95 samples

**M1.M6** · NAT · 2 marks. One-dimensional ridge regression without intercept gives w = Σxᵢyᵢ/(Σxᵢ² + λ). Find w for the points (1, 2) and (2, 4) with λ = 5.

**M1.M7** · MSQ · 2 marks. Which statements about bias and variance are correct? (A) Bagging reduces variance (B) A straight line fitted to a strongly curved relationship has high bias (C) A 1-nearest-neighbour classifier has low bias and high variance (D) More training data reduces the bias of a fixed model class

**M1.M8** · MCQ · 2 marks. A linear model has w = (1, −2). For x = (2, 1) with true y = 3, the loss is the squared error plus 0.5‖w‖². The loss is (A) 14 (B) 9 (C) 11.5 (D) 3.5

**M1.M9** · NAT · 2 marks. With TP = 30 and FN = 20, find the recall. (Round off to one decimal place)

### Hard

**M1.H1** · NAT · 2 marks. Fit y = β₀ + β₁x₁ + β₂x₂ by least squares to (x₁, x₂, y) = (0, 0, 1), (1, 0, 3), (0, 1, 4) and (1, 1, 6). Find β₂.

**M1.H2** · MCQ · 2 marks. One feature is removed from a linear regression with an intercept, and the model is refitted on the same training data. The training R² (A) cannot increase (B) cannot decrease (C) stays the same (D) always decreases strictly

**M1.H3** · MSQ · 2 marks. Of 1000 samples, 200 are held out as a test set first, and 4-fold cross-validation is run on the rest. Which statements are correct? (A) Each model is trained on 600 samples (B) Leave-one-out on the same data would create 800 splits (C) Each fold has 200 samples (D) The test set is used during cross-validation

**M1.H4** · NAT · 2 marks. A linear model y = wᵀx has w = (2, −1). For x = (1, 3), the true value is y = 2x₁ − x₂ + 1. The loss is the absolute error plus 0.1‖w‖². Find the loss. (Round off to one decimal place)

**M1.H5** · MCQ · 2 marks. Raising a classifier's decision threshold for the positive class usually (A) raises precision and lowers recall (B) lowers precision and raises recall (C) raises both (D) lowers both

**M1.H6** · NAT · 2 marks. With TN = 90 and FP = 10, find the specificity. (Round off to one decimal place)

**M1.H7** · MSQ · 2 marks. For ordinary least squares with an intercept, which statements hold on the training data? (A) The residuals sum to zero (B) The residuals are orthogonal to every feature column (C) R² can be negative (D) The fitted hyperplane passes through the origin
