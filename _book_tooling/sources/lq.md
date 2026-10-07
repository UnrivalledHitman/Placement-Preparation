# How to use this practice book
%41 exercises matching the Low-Level Design guide, with hints kept separate and runnable Java solutions

Each part matches chapters of the **Low-Level Design in Java** guide. Design and code each exercise yourself first: write the classes, compile them, and run a small `main`. Only then compare with the solution. Every solution is a complete single-file program that runs with `java Main.java` (Java 21 or later), and its output is shown.

| Type | What you do |
|---|---|
| Concept | Classify, explain or predict, in words |
| Code | Write or fix a working program |
| Design | Model a system (requirements, classes, patterns), then code its core |

**Marking scheme.** Mark each attempt ✓ (solved alone), ~ (solved with the hint) or ✗ (needed the solution). For Code and Design exercises, also check yourself against the rubric from the guide: clear responsibilities, extension points where change is likely, edge cases, and thread safety where state is shared. Redo every ~ and ✗ a week later and record it in the tracker.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1 | OOP and UML | 4 |
| 2 | 2 | SOLID and design principles | 6 |
| 3 | 3 | Creational patterns | 5 |
| 4 | 4 | Structural patterns | 5 |
| 5 | 5 | Behavioural patterns | 6 |
| 6 | 6 | Concurrency in design | 5 |
| 7 | 7–8 | Extending the case studies | 6 |
| 8 | 9 | Timed mock problems (45 minutes each) | 4 |

# Exercises

## Part 1: OOP and UML

**L1.1 · Easy · Concept · Name the relationship.** Classify each pair as dependency, association, aggregation, composition, generalisation or realisation: (a) `House` and `Room`; (b) `Team` and `Player`; (c) `OrderService.place(order, PaymentGateway g)` uses the gateway only inside the method; (d) `Student` and `Course` (students enrol in many courses); (e) `ArrayList` and `List`; (f) `SavingsAccount` and `Account`.

**L1.2 · Medium · Concept · Predict the output.** Predict what this prints, then run it: a `Parent` with a field `name = "parent"`, a static method `id()` returning `"P"` and an instance method `who()` returning `"Parent"`; a `Child extends Parent` that redeclares all three (`"child"`, `"C"`, `"Child"`). The program creates `Parent p = new Child()` and prints `p.name`, `p.id()` and `p.who()`.

**L1.3 · Medium · Code · Plug the encapsulation leaks.** A `SensorLog` class has a public `List<Double> readings` field and a constructor that stores the caller's list directly. Show two ways outside code can corrupt it, then make the class properly encapsulated (and ideally immutable) so that both attacks fail.

**L1.4 · Easy · Design · An online quiz.** Draw a class diagram for an online quiz system: a quiz has many questions, each question has 2–5 options of which exactly one is correct, a user makes attempts at quizzes, and an attempt records the chosen option per question and computes a score. Give multiplicities and say which relationships are compositions. Then code the core classes with score calculation.

## Part 2: SOLID and design principles

**L2.1 · Easy · Concept · Which principle is broken?** (a) `EmailService` has methods `send`, `formatHtml`, `connectSmtp` and `saveToAuditDb`; (b) every new tax region requires editing a `switch` in `TaxCalculator`; (c) `Ostrich extends Bird` throws in `fly()`; (d) a `Printer` interface forces a basic printer to implement `scan()` and `fax()`; (e) `CheckoutService` creates `new MySqlOrderRepository()` in its constructor.

**L2.2 · Medium · Code · Open the report generator.** `ReportGenerator.generate(data, format)` contains a `switch` on `"CSV"`, `"HTML"` and `"MARKDOWN"`. Refactor it so that adding a JSON format requires no change to existing classes, then add JSON.

**L2.3 · Medium · Code · Fix a Liskov violation.** `ReadOnlyDocument extends Document` overrides `write(String)` to throw `UnsupportedOperationException`. A method `appendFooter(Document d)` crashes when given a read-only document. Redesign the types so that the compiler prevents this mistake.

**L2.4 · Medium · Code · Inject the dependency and test it.** `WeatherAlertService` builds an `HttpWeatherClient` inside itself and alerts when the temperature exceeds 40 °C. Refactor it for dependency inversion and write a test, using a fake provider, that checks the alert fires at 41 °C and not at 39 °C (print the results).

**L2.5 · Medium · Concept · Obey the Law of Demeter.** `checkout.pay(order)` contains `order.getCustomer().getWallet().getBalance()` and `order.getCustomer().getWallet().deduct(amount)`. What is wrong, and how should the responsibilities move? Write the improved classes.

**L2.6 · Hard · Design · Break up a god class.** `UserManager` registers users, validates emails, hashes passwords, stores users, sends welcome emails and exports all users to CSV. Split it by responsibility, wire the pieces with constructor injection, and show registration and export working.

## Part 3: Creational patterns

**L3.1 · Medium · Code · A thread-safe ID generator.** Write a lazily created singleton `IdGenerator` that returns unique increasing ids. Prove with 8 threads requesting 100 000 ids in total that every id is unique and there is exactly one generator instance.

**L3.2 · Medium · Code · A validating builder.** Build an immutable `Pizza` with a required size (S, M, L), a crust (default thin), and up to 5 toppings. `build()` must reject a missing size, more than 5 toppings, and duplicate toppings.

**L3.3 · Medium · Code · A shape factory from text.** Parse lines such as `circle 2`, `rect 3 4` and `square 5` into `Shape` objects using a registry factory, print each area, and reject unknown shapes and wrong argument counts with clear messages.

**L3.4 · Medium · Concept · Singleton versus injection.** `OrderService` calls `Database.getInstance().save(order)`. Explain why this hurts testing, and refactor so that tests can use an in-memory database while production still has exactly one real instance.

**L3.5 · Hard · Code · A prototype registry.** Keep a registry of document templates (offer letter, invoice), each with a title and a list of sections. `create(name)` must return an independent deep copy. Show that editing a created document leaves the template untouched.

## Part 4: Structural patterns

**L4.1 · Medium · Code · Adapt a legacy gateway.** Your app uses `PaymentProcessor.pay(long paise, String currency)` returning a `Receipt`. A legacy `XmlGateway.process(String xml)` returns an XML string like `<ok id='TX9'/>` or `<fail reason='...'/>`. Write an adapter.

**L4.2 · Medium · Code · Decorated coffee.** Model a coffee shop where a base drink (espresso Rs 120, latte Rs 150) can be decorated with any number of add-ons (extra shot Rs 40, oat milk Rs 30, caramel Rs 25). Print the description and price of three orders, including one with two extra shots.

**L4.3 · Medium · Code · A quota proxy.** Wrap a `SearchService` in a proxy that allows each user at most 3 searches and caches repeated queries per user (cached answers do not use quota). Show the backend call count.

**L4.4 · Medium · Code · An org chart composite.** Employees and managers form a tree. Compute the total salary cost and headcount of any subtree, and print the tree with indentation.

**L4.5 · Easy · Concept · Which structural pattern?** (a) Add logging and retry around an HTTP client without changing it; (b) lazily load a 50 MB report only when displayed; (c) make a third-party SMS SDK fit your `Notifier` interface; (d) one `bookTrip()` call that coordinates flights, hotels and cabs; (e) shapes that can be drawn by a raster or a vector renderer, without a class for every combination.

## Part 5: Behavioural patterns

**L5.1 · Medium · Code · Shipping cost strategies.** Implement shipping cost strategies (standard: Rs 40 + Rs 10/kg; express: Rs 100 + Rs 20/kg; free over Rs 999 order value for standard). A selector picks the strategy from the order. Print costs for three orders.

**L5.2 · Medium · Code · Price alerts with unsubscribe.** A `StockTicker` publishes prices. Observers register "notify me when price crosses X" alerts; an alert fires once and then unsubscribes itself. Show that firing alerts are removed safely during notification.

**L5.3 · Medium · Code · Macro commands with undo.** Smart-home commands: `LightOn`, `LightOff`, `SetBrightness(n)`. A `Macro` command runs several commands and undoes them in reverse. Show "movie mode" (lights dim to 20, TV light off) and its undo.

**L5.4 · Hard · Code · A traffic light with a pedestrian button.** States: green (30 s), yellow (5 s), red (20 s). A pedestrian button pressed during green shortens the remaining green to at most 5 s. Simulate 70 seconds in 5-second ticks with the button pressed at t = 10.

**L5.5 · Medium · Code · Expense approval chain.** A team lead approves up to Rs 10 000, a manager up to Rs 1 00 000, a director up to Rs 10 00 000; anything larger is rejected. Route five expense claims through the chain and print who approved each.

**L5.6 · Medium · Code · Template method exporters.** Write a template-method exporter with fixed steps (header, rows, footer) and two subclasses: CSV and a Markdown table. Export the same three-row data set with both.

## Part 6: Concurrency in design

**L6.1 · Medium · Code · Three thread-safe counters.** Implement a counter with `synchronized`, with `AtomicLong` and with `LongAdder`. Increment each 1 000 000 times from 8 threads and print the totals (they must all be exact).

**L6.2 · Hard · Code · Your own blocking queue.** Implement a bounded blocking queue with `synchronized`, `wait()` and `notifyAll()`. Run 3 producers and 3 consumers through it and verify that every item is consumed exactly once.

**L6.3 · Medium · Code · Username registration race.** `register(name)` checks `if (!users.containsKey(name))` and then puts. With 1 000 threads registering 10 distinct names, make sure exactly 10 registrations succeed and every other attempt is told the name is taken.

**L6.4 · Hard · Code · Deadlock-free dining philosophers.** Five philosophers each need both neighbouring forks (locks) to eat. Show a design that cannot deadlock, run each philosopher for 1 000 meals, and print that all finished.

**L6.5 · Medium · Concept · Make Money immutable.** List the rules for an immutable class, then write an immutable `Money` (amount in paise, currency) with `plus`, `times` and validation, and show that "modifying" operations return new objects.

## Part 7: Extending the case studies

**L7.1 · Medium · Code · Parking lot: EV spots and a size-first allocator.** Add EV spots (only electric cars may use them, charged Rs 15 per hour of charging on top of parking) and an allocator that tries the smallest suitable spot size first, keeping large spots for trucks.

**L7.2 · Medium · Code · An LRU cache with TTL.** Combine the guide's LRU cache with per-entry expiry: `put(k, v, ttlMs, now)`, `get(k, now)`. Expired entries are misses and are removed; capacity eviction still follows recency.

**L7.3 · Medium · Code · Seat categories and coupons.** Extend the movie booking design: seats have categories (recliner Rs 450, gold Rs 300, silver Rs 200), and a coupon strategy can apply a flat discount or a percentage with a cap. Price two bookings.

**L7.4 · Medium · Code · Splitwise groups.** Add groups to the expense-sharing design: expenses belong to a group, balances and simplified settlements are computed per group. Show two groups with an overlapping member.

**L7.5 · Hard · Code · Plan-based rate limits.** Extend the token-bucket limiter so each client has a plan (free: 5 burst, 1 token/2 s; pro: 20 burst, 2 tokens/s) that can be upgraded at run time. Show a free client being throttled, then upgraded.

**L7.6 · Medium · Code · Vending machine change-making.** Give the vending machine a limited inventory of coins. Before accepting a sale, check that change can be made from the coins it holds (greedy is fine for denominations 1, 2, 5, 10, 20); otherwise refuse and refund.

## Part 8: Timed mock problems

**L8.1 · Hard · Design · Meeting room booking.** Rooms have capacities. Users book a room for a time interval; overlapping bookings for the same room are rejected; a user can ask for any free room that fits a group size at a given interval; bookings can be cancelled. Aim for O(log n) conflict checks.

**L8.2 · Hard · Design · Cab booking (Uber-lite).** Riders request rides from A to B on a grid; the nearest available driver is assigned; rides move through requested, accepted, started and completed states; fares use a strategy (base + per km, with surge). Drivers become available again after a ride.

**L8.3 · Hard · Design · Warehouse inventory reservations.** Products have stock. Orders reserve stock (all items or nothing), payment commits the reservation, and timeouts or cancellations release it. Subscribers are alerted when stock drops below a threshold. Must be safe for concurrent orders.

**L8.4 · Hard · Design · An in-memory file system.** Support `mkdir(path)`, `addContent(filePath, text)` (creating the file if needed, appending otherwise), `readContent(filePath)`, and `ls(path)` (sorted names; for a file, just its name), plus total size of a directory.
