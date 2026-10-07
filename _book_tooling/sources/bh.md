# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| B1.1 | Your own classes are scanned; JDK classes need a factory method. Two candidates need a tie-breaker |
| B1.2 | Command line > system properties > environment > files > defaults |
| B1.3 | A record with `List<Slab>`; `@Validated`, `@NotEmpty` and `@Valid` on the list so that elements are checked |
| B1.4 | Ask what each class really needs; extract the shared part (amount lookup) into a third bean |
| B1.5 | The container hands a prototype over and forgets it |

## Part 2 hints

| Exercise | Hint |
|---|---|
| B2.1 | 201, 204, 404, 400, 409, 403, 401, 503, 429 are all candidates |
| B2.2 | Bind the body to a `Map<String, Object>`, check its keys against an allowed set, then apply each one |
| B2.3 | Repository method `Page<Reading> findByMeterSerial(String s, Pageable p)`; map the page to a record |
| B2.4 | Store key → (hash of body, response); compare the body hash on a repeat |
| B2.5 | Resources are nouns; state changes such as "stop" can be sub-resources or `PATCH` on a status |

## Part 3 hints

| Exercise | Hint |
|---|---|
| B3.1 | Each distinct meter is loaded once per persistence context; `join fetch r.meter` |
| B3.2 | `select new ...TopMeter(m.serial, sum(r.kwh)) ... group by m.serial order by sum(r.kwh) desc` plus `Pageable` or `setMaxResults` |
| B3.3 | 1 query for the meters + ⌈12 / 5⌉ batched `IN` queries |
| B3.4 | ToOne is eager, ToMany is lazy; the side with the foreign key owns the relationship |
| B3.5 | A bulk update bypasses the persistence context; already loaded entities keep old values |

## Part 4 hints

| Exercise | Hint |
|---|---|
| B4.1 | Runtime → rollback; checked → commit; swallowed → commit; no proxy → no transaction |
| B4.2 | `REQUIRES_NEW` needs the proxy; move `generateOne` to another bean |
| B4.3 | One `@Transactional` method doing both steps; throw a runtime exception when the credit fails |
| B4.4 | The retry loop must be **outside** the transaction, each attempt a new transaction (`TransactionTemplate` or a separate bean) |

## Part 5 hints

| Exercise | Hint |
|---|---|
| B5.1 | Is the caller identified? If not, 401. If yes but not allowed, 403 |
| B5.2 | `@PreAuthorize("#name == authentication.name or hasRole('ADMIN')")`; compile with `-parameters` |
| B5.3 | Per-user record: failures and lockedUntil; check the lock before the password |
| B5.4 | HttpOnly cookies, deny-lists or short lifetimes, asymmetric keys, claims are public |

## Part 6 hints

| Exercise | Hint |
|---|---|
| B6.1 | `@CsvSource({"0,0", "1,500", ...})` with the expected paise |
| B6.2 | `content().contentType(MediaType.APPLICATION_PROBLEM_JSON)` and `jsonPath("$.fields.serial").exists()` |
| B6.3 | `Timer.builder(...).register(registry)`; `timer.record(Duration)`; `count()`, `totalTime`, `mean`, `max` |
| B6.4 | Liveness: "restart me would help"; readiness: "do not send me traffic right now" |

## Part 7 hints

| Exercise | Hint |
|---|---|
| B7.1 | Catch `DataIntegrityViolationException` around the whole transaction and retry the batch once: the retry sees the other request's rows |
| B7.2 | `ZonedDateTime` in `Asia/Kolkata`; group by `YearMonth.from(ts.atZone(IST))` |
| B7.3 | `select m from Meter m where not exists (select r from Reading r where r.meter = m and r.ts > :cutoff)` |
| B7.4 | 10<sup>6</sup> × 4 readings per hour; batches mean requests = meters per hour |
