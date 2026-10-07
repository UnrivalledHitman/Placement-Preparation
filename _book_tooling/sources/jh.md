# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| J1.1 | Only one of them is a class you call statically; one is an exception |
| J1.2 | `getMetaData().getTables(null, "PUBLIC", "%", new String[]{"TABLE"})`, then `getColumns` |
| J1.3 | Closing a connection closes its statements and their result sets |
| J1.4 | The first two characters are the class: 23, 42, 08, 40, HY |

## Part 2 hints

| Exercise | Hint |
|---|---|
| J2.1 | Bind the city; map the sort column through a `Map` of allowed names |
| J2.2 | Escape `\`, `%` and `_` in the input, then use `LIKE ? ESCAPE '\'` |
| J2.3 | `wasNull()` reports the last column read |
| J2.4 | `String.join(", ", Collections.nCopies(n, "?"))` |
| J2.5 | `setBigDecimal`, and `setObject` with an `OffsetDateTime` in UTC for a `TIMESTAMP WITH TIME ZONE` column |

## Part 3 hints

| Exercise | Hint |
|---|---|
| J3.1 | Each statement commits by itself in auto-commit mode |
| J3.2 | Catch, roll back, then count rows in both tables |
| J3.3 | `setSavepoint()` before each row, `rollback(sp)` on failure |
| J3.4 | A range count: does the new row appear in the second count? |
| J3.5 | `UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?`; check the row count |

## Part 4 hints

| Exercise | Hint |
|---|---|
| J4.1 | `e.getUpdateCounts()`; H2 continues after the failure and marks the failed entry |
| J4.2 | Count calls whose method name starts with `execute` |
| J4.3 | Remember the last id of each page |
| J4.4 | Multi-row `INSERT ... VALUES (...), (...)` |

## Part 5 hints

| Exercise | Hint |
|---|---|
| J5.1 | 8 × 25 + 20 |
| J5.2 | The threshold is in milliseconds; compare active counts |
| J5.3 | Where do the queries actually wait? |

## Part 6 hints

| Exercise | Hint |
|---|---|
| J6.1 | `GROUP BY CAST(ts AS DATE)`; the in-memory version groups a list |
| J6.2 | A transaction lives on one connection |
| J6.3 | `MessageDigest.getInstance("SHA-256")` on the script text |
| J6.4 | Expand, migrate, contract |

## Part 7 hints

| Exercise | Hint |
|---|---|
| J7.1 | One servlet instance, many threads |
| J7.2 | `System.nanoTime()` before and after `chain.doFilter` |
| J7.3 | Chapter 9.3 of the guide |
