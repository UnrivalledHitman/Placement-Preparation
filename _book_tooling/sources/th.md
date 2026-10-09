# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| T1.1 | Fast, Independent, Repeatable, Self-validating, Timely; some cases violate two |
| T1.2 | Test both sides of every boundary: 4 and 5, 17 and 18, 59 and 60, plus −1 and 121 |
| T1.3 | `@CsvSource` rows can name the rule; JUnit converts strings to enum constants |
| T1.4 | Write the expected transition table in the test, then use `@TestFactory` over states × events |
| T1.5 | Which two things does the method create for itself? Inject a `Clock` and a mailer interface |

## Part 2 hints

| Exercise | Hint |
|---|---|
| T2.1 | Record each call in a static list and assert on it from a third, ordered test |
| T2.2 | Try commas in the wrong places, negative numbers and three decimal places |
| T2.3 | `assertAll` with a stream of executables reports every failure |
| T2.4 | No duplicates; same set of values; first occurrences keep their relative order |
| T2.5 | Static state survives between tests; force the bad order with `@TestMethodOrder` |

## Part 3 hints

| Exercise | Hint |
|---|---|
| T3.1 | Ask: is it used, does it answer, does it behave, or must its calls be checked? |
| T3.2 | `ArgumentCaptor` for the body; `verifyNoInteractions` for the unknown user |
| T3.3 | `thenThrow(...).thenThrow(...).thenReturn(...)`, `times(3)` and `inOrder` |
| T3.4 | Matchers are all-or-nothing; strict stubs report argument mismatches |
| T3.5 | Which test survives a refactoring that changes how the repository is called? |

## Part 4 hints

| Exercise | Hint |
|---|---|
| T4.1 | Inject the sleeping function so the test can record durations instead of waiting |
| T4.2 | Inject a `Clock` and a `ZoneId`; 06:30 UTC is 12:00 in India |
| T4.3 | Which inputs would make each mutant behave differently? |
| T4.4 | P(red) = 1 − (1 − p)^n; a retried test fails only if both runs fail |
| T4.5 | Walk up the pyramid; name a tool and a failure it catches at each level |
