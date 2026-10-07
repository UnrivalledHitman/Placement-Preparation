# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| L1.1 | Ask two questions: is it is-a or has-a, and does the part die with the whole? |
| L1.2 | Which of the three is dispatched on the run-time type? |
| L1.3 | One attack uses the field, the other uses the list the caller passed in |
| L1.4 | Compositions: the parts cannot exist alone. Validate option counts in the constructor |

## Part 2 hints

| Exercise | Hint |
|---|---|
| L2.1 | Reasons to change; editing a switch; a subtype that throws; fat interface; `new` in a constructor |
| L2.2 | One interface, one class per format, a map from name to format |
| L2.3 | Split the capability: not every document can be written |
| L2.4 | Make the provider and the alert destination interfaces; lambdas make good fakes |
| L2.5 | Tell, don't ask: who should decide whether the wallet can pay? |
| L2.6 | List the six jobs and give each its own class; one service coordinates |

## Part 3 hints

| Exercise | Hint |
|---|---|
| L3.1 | Holder idiom for the instance, `AtomicLong` for the counter |
| L3.2 | Validate everything in `build()`, copy the toppings list into the immutable object |
| L3.3 | Store the number of arguments with each maker in the registry |
| L3.4 | Who decides that there is only one instance: the class itself, or the code that wires the application? |
| L3.5 | Which fields are mutable objects? Those must be copied, not shared |

## Part 4 hints

| Exercise | Hint |
|---|---|
| L4.1 | Build the XML, call the gateway, parse both reply shapes, throw on anything else |
| L4.2 | Every add-on wraps a `Drink` and is a `Drink` |
| L4.3 | Check the cache before spending quota |
| L4.4 | A manager's cost is their salary plus the cost of every report |
| L4.5 | Same interface plus behaviour, lazy access, interface translation, simplification, two dimensions |

## Part 5 hints

| Exercise | Hint |
|---|---|
| L5.1 | Keep the selection rule apart from the cost formulas |
| L5.2 | Removing a listener while iterating needs a collection that iterates over a snapshot |
| L5.3 | A macro is a command made of commands; undo in reverse order |
| L5.4 | Each state knows its duration and its successor; the button only changes the remaining time in green |
| L5.5 | Each approver either approves or forwards; the last one rejects |
| L5.6 | Make the skeleton method `final`; give the footer a default empty implementation |

## Part 6 hints

| Exercise | Hint |
|---|---|
| L6.1 | `synchronized` methods, `incrementAndGet`, `increment` + `sum` |
| L6.2 | `wait()` inside a `while` loop; `notifyAll()` after every change |
| L6.3 | One atomic map operation replaces check-then-put |
| L6.4 | Number the forks; always take the lower-numbered fork first |
| L6.5 | Final class, final fields, validation in the constructor, new objects from every operation |

## Part 7 hints

| Exercise | Hint |
|---|---|
| L7.1 | Order spot sizes from small to large and prefer the smallest that fits; EV cars prefer EV spots |
| L7.2 | `LinkedHashMap` with access order gives recency; store an expiry time with each value |
| L7.3 | Prices come from the seat category; coupons are strategies applied to the gross amount |
| L7.4 | Keep one ledger per group |
| L7.5 | Keep the plan separate from the bucket state, so the plan can change without losing tokens |
| L7.6 | Compute the change plan before committing; the inserted coins may be part of the change |

## Part 8 hints

| Exercise | Hint |
|---|---|
| L8.1 | A sorted map of bookings per room: check the booking just before and just after the new start |
| L8.2 | An enum of ride states with allowed transitions; matching must mark the driver busy atomically |
| L8.3 | Track reserved separately from on-hand stock; check and reserve under one lock |
| L8.4 | A composite of directories and files; directories keep children in a sorted map |
