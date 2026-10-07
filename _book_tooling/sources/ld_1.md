# Chapter 3: Creational Patterns
%Controlling how objects are created: Singleton, Factory Method, Abstract Factory, Builder and Prototype

Creational patterns move `new` out of business code. That matters because `new ConcreteClass()` is the tightest coupling Java has: the caller now depends on that exact class, its constructor and its dependencies.

| Pattern | Problem | Interview cue |
|---|---|---|
| Singleton | Exactly one instance, globally accessible | Logger, configuration, connection pool, ID generator |
| Factory Method | Create one of several related types without the caller knowing which | "Create a notification for a channel", "create a vehicle by type" |
| Abstract Factory | Create **families** of related objects that must match | UI themes, cloud provider SDKs, database drivers |
| Builder | Construct complex objects step by step, often immutable | Many optional parameters, validation before creation |
| Prototype | Create new objects by copying an existing one | Expensive setup, configurable templates, game objects |

## 3.1 Singleton

| Variant | Thread-safe | Lazy | Notes |
|---|---|---|---|
| Eager (`static final` field) | Yes (class loading is thread-safe) | No | Simplest; fine when creation is cheap |
| Lazy with `synchronized` getter | Yes | Yes | Every call pays for a lock |
| Double-checked locking | Yes, **only** with `volatile` | Yes | Without `volatile`, another thread can see a half-constructed object |
| Initialisation-on-demand holder | Yes | Yes | Uses the class loader's guarantees; the idiomatic Java answer |
| `enum` with one constant | Yes | No (on first use of the enum) | Also safe against reflection and serialisation: Joshua Bloch's recommendation |

The holder idiom is lazy and lock-free: `Holder` is not loaded until `get()` first touches it, and class initialisation is guaranteed by the JVM to run once. But any singleton with a private constructor can be broken by reflection, which can call that constructor anyway. An `enum` cannot: the JVM refuses to instantiate enum types reflectively.

```java run Singleton variants and the reflection attack
import java.lang.reflect.Constructor;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static class DclConfig {                           // double-checked locking
        private static volatile DclConfig instance;
        private DclConfig() {}
        static DclConfig get() {
            DclConfig local = instance;
            if (local == null) {
                synchronized (DclConfig.class) {
                    local = instance;
                    if (local == null) instance = local = new DclConfig();
                }
            }
            return local;
        }
    }
    static class HolderConfig {                        // initialisation-on-demand holder
        private HolderConfig() {}
        private static class Holder {
            static final HolderConfig INSTANCE = new HolderConfig();
        }
        static HolderConfig get() { return Holder.INSTANCE; }
    }
    enum EnumConfig {                                  // enum singleton
        INSTANCE;
        private final Map<String, String> settings = new ConcurrentHashMap<>();
        void put(String k, String v) { settings.put(k, v); }
        String get(String k) { return settings.get(k); }
    }

    static <T> int distinct(Callable<T> getter) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        List<Future<T>> fs = new ArrayList<>();
        for (int i = 0; i < 1000; i++) fs.add(pool.submit(getter));
        Set<T> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        for (Future<T> f : fs) seen.add(f.get());
        pool.shutdown();
        return seen.size();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("DCL instances across 8 threads   : "
                + distinct(DclConfig::get));
        System.out.println("holder instances across 8 threads: "
                + distinct(HolderConfig::get));
        EnumConfig.INSTANCE.put("region", "ap-south-1");
        System.out.println("enum shared state                : "
                + EnumConfig.INSTANCE.get("region"));

        Constructor<HolderConfig> c = HolderConfig.class.getDeclaredConstructor();
        c.setAccessible(true);
        System.out.println("reflection made a second holder? "
                + (c.newInstance() != HolderConfig.get()));
        try {
            Constructor<?> e = EnumConfig.class.getDeclaredConstructors()[0];
            e.setAccessible(true);
            e.newInstance("INSTANCE2", 1);
        } catch (IllegalArgumentException ex) {
            System.out.println("reflection on the enum           : " + ex.getMessage());
        }
    }
}
```

> TRAP: The classic broken version is lazy initialisation without synchronisation: `if (instance == null) instance = new X();`. Two threads can both see `null` and both construct. Whether that happens in a given run depends on timing, which is exactly why such bugs survive testing. Know the fixed versions and explain why `volatile` is needed in double-checked locking (it forbids reordering the write of the reference before the constructor finishes).

> NOTE: Singletons are global state, which makes testing harder. In modern code, a dependency-injection container usually creates one instance and injects it (Spring beans are singletons by default), so classes still receive their dependencies through constructors.

## 3.2 Factory Method

A factory hides *which* concrete class is created. Callers ask for "a notifier for SMS" and receive a `Notifier`; adding WhatsApp means adding one class and one registration, not editing callers.

```java run A registry-based factory
import java.util.*;
import java.util.function.Supplier;

public class Main {
    interface Notifier { String send(String to, String msg); }
    static class Email implements Notifier {
        public String send(String to, String m) { return "[email] " + to + ": " + m; }
    }
    static class Sms implements Notifier {
        public String send(String to, String m) { return "[sms] " + to + ": " + m; }
    }
    static class Push implements Notifier {
        public String send(String to, String m) { return "[push] " + to + ": " + m; }
    }

    static class NotifierFactory {
        private final Map<String, Supplier<Notifier>> registry = new HashMap<>();
        void register(String channel, Supplier<Notifier> maker) { registry.put(channel,
                maker); }
        Notifier create(String channel) {
            Supplier<Notifier> maker = registry.get(channel.toLowerCase());
            if (maker == null) throw new IllegalArgumentException("unknown channel "
                    + channel);
            return maker.get();
        }
    }

    public static void main(String[] args) {
        NotifierFactory f = new NotifierFactory();
        f.register("email", Email::new);
        f.register("sms", Sms::new);
        f.register("push", Push::new);   // new channel: one line, no caller changes
        for (String ch : List.of("email", "SMS", "push"))
            System.out.println(f.create(ch).send("asha", "your order shipped"));
        try {
            f.create("pigeon");
        } catch (IllegalArgumentException e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}
```

The GoF *Factory Method* proper is an overridable method in a base class (`abstract Transport createTransport()`, overridden by `RoadLogistics` and `SeaLogistics`). The registry version above is the "simple factory" most interview code uses; both answer the same question: how to add a type without touching callers.

## 3.3 Abstract Factory

Use an abstract factory when products come in **families** that must not be mixed. Below, a `PaymentKit` creates a gateway and a fraud checker that belong together. Switching the whole system from one provider to another is one line, and it is impossible to pair one provider's gateway with another's fraud checker by accident.

```java run Matching families of objects
public class Main {
    interface Gateway { String charge(int paise); }
    interface FraudCheck { boolean ok(String card); }
    interface PaymentKit { Gateway gateway(); FraudCheck fraud(); }

    static class RazorKit implements PaymentKit {
        public Gateway gateway() { return p -> "Razor charged Rs " + p / 100.0; }
        public FraudCheck fraud() { return card -> !card.startsWith("0000"); }
    }
    static class StripeKit implements PaymentKit {
        public Gateway gateway() { return p -> "Stripe charged Rs " + p / 100.0; }
        public FraudCheck fraud() { return card -> card.length() == 16; }
    }

    static class Checkout {                         // knows only the abstract factory
        private final Gateway gateway; private final FraudCheck fraud;
        Checkout(PaymentKit kit) { gateway = kit.gateway(); fraud = kit.fraud(); }
        String pay(String card, int paise) {
            return fraud.ok(card) ? gateway.charge(paise) : "blocked by fraud check";
        }
    }

    public static void main(String[] args) {
        for (PaymentKit kit : new PaymentKit[] {new RazorKit(), new StripeKit()}) {
            Checkout c = new Checkout(kit);
            System.out.println(kit.getClass().getSimpleName() + ": "
                    + c.pay("4111111111111111", 49900)
                    + " | " + c.pay("0000123", 100));
        }
    }
}
```

## 3.4 Builder

Builders solve the **telescoping constructor** problem (`new Pizza(size, true, false, true, null, 2)`, where nobody knows which `true` means cheese). The builder names each parameter, supplies defaults, validates everything at once in `build()`, and returns an immutable object.

```java run An immutable object with a validating builder
import java.util.*;

public class Main {
    static final class HttpRequest {
        private final String method, url, body;
        private final Map<String, String> headers;
        private final int timeoutMs;
        private HttpRequest(Builder b) {
            method = b.method; url = b.url; body = b.body; timeoutMs = b.timeoutMs;
            headers = Collections.unmodifiableMap(new LinkedHashMap<>(b.headers));
        }
        @Override public String toString() {
            return method + " " + url + " headers=" + headers + " timeout=" + timeoutMs
                    + "ms"
                    + (body == null ? "" : " body=" + body);
        }
        static Builder builder(String url) { return new Builder(url); }

        static final class Builder {
            private final String url;
            private String method = "GET", body;
            private final Map<String, String> headers = new LinkedHashMap<>();
            private int timeoutMs = 5000;
            private Builder(String url) { this.url = url; }
            Builder method(String m) { method = m; return this; }
            Builder header(String k, String v) { headers.put(k, v); return this; }
            Builder body(String b) { body = b; return this; }
            Builder timeout(int ms) { timeoutMs = ms; return this; }
            HttpRequest build() {
                if (!url.startsWith("https://"))
                    throw new IllegalStateException("https only");
                if (method.equals("GET") && body != null)
                    throw new IllegalStateException("GET must not have a body");
                if (timeoutMs <= 0)
                    throw new IllegalStateException("timeout must be positive");
                return new HttpRequest(this);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println(HttpRequest.builder("https://api.shop.in/items").build());
        System.out.println(HttpRequest.builder("https://api.shop.in/orders").method("POST")
                .header("Content-Type", "application/json").body("{\"item\":7}")
                        .timeout(2000).build());
        try {
            HttpRequest.builder("https://api.shop.in/items").body("oops").build();
        } catch (IllegalStateException e) {
            System.out.println("rejected: " + e.getMessage());
        }
    }
}
```

Java records with compact constructors cover simple cases; Lombok's `@Builder` generates this code in real projects. In an interview, writing the builder by hand shows you understand immutability and validation.

## 3.5 Prototype

Prototype creates objects by copying a configured instance. The important detail is **shallow versus deep copy**: a shallow copy shares mutable fields with the original, so changing the copy silently changes the original.

```java run Shallow versus deep copies
import java.util.*;

public class Main {
    static class Shape {
        String colour; List<int[]> points;
        Shape(String colour, List<int[]> points) {
                this.colour = colour; this.points = points; }
        Shape shallowCopy() { return new Shape(colour, points); }
        Shape deepCopy() {
            List<int[]> copy = new ArrayList<>();
            for (int[] p : points) copy.add(p.clone());
            return new Shape(colour, copy);
        }
        String describe() {
            StringBuilder sb = new StringBuilder(colour + " ");
            for (int[] p : points) sb.append(Arrays.toString(p));
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        Shape template = new Shape("red", new ArrayList<>(List.of(new int[] {0, 0},
                new int[] {4, 3})));
        Shape s = template.shallowCopy();
        s.colour = "blue"; s.points.get(1)[0] = 99;
        System.out.println("after editing a SHALLOW copy, template = "
                + template.describe());

        template.points.get(1)[0] = 4;
        Shape d = template.deepCopy();
        d.colour = "green"; d.points.get(1)[0] = 77;
        System.out.println("after editing a DEEP copy,    template = "
                + template.describe());
        System.out.println("deep copy                              = " + d.describe());
    }
}
```

Changing the copy's `colour` never affects the template (strings are immutable and the field was reassigned), but changing a point inside the shared list does. Avoid `Object.clone()` in new code (its contract is awkward); prefer copy constructors or explicit `copy()` methods as above.

## 3.6 Practical lessons

- Singleton: know eager, holder and enum versions; explain `volatile` in double-checked locking; prefer DI over global access.
- Factory: hide concrete classes; a registry of suppliers makes new types one-line additions.
- Abstract Factory: when objects come in families that must match.
- Builder: many optional parameters, validation at `build()`, immutable result.
- Prototype: copy configured objects; be explicit about deep versus shallow copies.

# Chapter 4: Structural Patterns
%Composing classes and objects: Adapter, Decorator, Proxy, Facade, Composite, Bridge and Flyweight

| Pattern | Problem | Everyday example |
|---|---|---|
| Adapter | Make an incompatible interface fit the one you need | A travel plug adapter; wrapping a legacy API |
| Decorator | Add responsibilities to an object dynamically, in layers | Java I/O streams: `new BufferedReader(new InputStreamReader(...))` |
| Proxy | Control access to an object: lazy loading, caching, security, remote calls | Hibernate lazy entities, Spring `@Transactional` proxies |
| Facade | One simple entry point to a complex subsystem | A "checkout" service hiding inventory, payment and shipping |
| Composite | Treat individual objects and groups uniformly (trees) | Files and folders; UI component trees |
| Bridge | Vary two dimensions independently instead of multiplying subclasses | Remote controls × devices; shapes × renderers |
| Flyweight | Share common state among very many small objects | Characters in an editor; trees in a game forest |

## 4.1 Adapter

A smart-home app expects every temperature sensor to report Celsius through `TemperatureSensor`. A third-party sensor library reports Fahrenheit with a different method name, and you cannot change its code. An adapter wraps it and translates.

```java run Adapting a third-party sensor
import java.util.*;

public class Main {
    interface TemperatureSensor { String id(); double celsius(); }

    static class LocalSensor implements TemperatureSensor {
        public String id() { return "living-room"; }
        public double celsius() { return 26.5; }
    }
    static class AcmeThermoProbe {                    // third-party: cannot be changed
        String serial() { return "ACME-7781"; }
        double readFahrenheit() { return 98.6; }
    }
    static class AcmeAdapter implements TemperatureSensor {
        private final AcmeThermoProbe probe;
        AcmeAdapter(AcmeThermoProbe probe) { this.probe = probe; }
        public String id() { return probe.serial(); }
        public double celsius() { return (probe.readFahrenheit() - 32) * 5 / 9; }
    }

    public static void main(String[] args) {
        List<TemperatureSensor> sensors = List.of(new LocalSensor(), new AcmeAdapter(
                new AcmeThermoProbe()));
        for (TemperatureSensor s : sensors)
            System.out.printf("%-12s %.1f C%n", s.id(), s.celsius());
    }
}
```

## 4.2 Decorator

A decorator implements the same interface as the object it wraps and adds behaviour before or after delegating. Decorators stack in any order and combination, which avoids a subclass for every combination (`CompressedEncryptedFileSource`...).

```java run Stacking decorators on a data channel
public class Main {
    interface Channel { String send(String data); }
    static class Wire implements Channel {
        public String send(String data) { return data; }
    }
    static abstract class ChannelDecorator implements Channel {
        protected final Channel inner;
        ChannelDecorator(Channel inner) { this.inner = inner; }
    }
    static class Compress extends ChannelDecorator {          // toy compression: aaa -> 3a
        Compress(Channel c) { super(c); }
        public String send(String d) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < d.length(); ) {
                int j = i;
                while (j < d.length() && d.charAt(j) == d.charAt(i)) j++;
                sb.append(j - i).append(d.charAt(i));
                i = j;
            }
            return inner.send(sb.toString());
        }
    }
    static class Encrypt extends ChannelDecorator {   // toy cipher: shift letters by 1
        Encrypt(Channel c) { super(c); }
        public String send(String d) {
            StringBuilder sb = new StringBuilder();
            for (char ch : d.toCharArray()) sb.append(Character.isLetter(ch) ? (char) (ch
                    + 1) : ch);
            return inner.send(sb.toString());
        }
    }
    static class Log extends ChannelDecorator {
        Log(Channel c) { super(c); }
        public String send(String d) {
            String out = inner.send(d);
            System.out.println("   log: " + d.length() + " chars in, " + out.length()
                    + " out");
            return out;
        }
    }

    public static void main(String[] args) {
        String data = "aaaabbbcca";
        System.out.println("plain              : " + new Wire().send(data));
        System.out.println("compress->encrypt  : " + new Compress(new Encrypt(new Wire()))
                .send(data));
        System.out.println("encrypt->compress  : " + new Encrypt(new Compress(new Wire()))
                .send(data));
        System.out.println("logged+compressed  : " + new Log(new Compress(new Wire()))
                .send(data));
    }
}
```

Both orders produce `4b3c2d1b` here because this toy cipher shifts characters one at a time. With real encryption the order matters a great deal: compress **before** encrypting, because good ciphertext looks random and does not compress.

## 4.3 Proxy

A proxy has the same interface as the real object and controls access to it. The three common kinds: **virtual** (create the expensive object only when first needed), **protection** (check permissions), and **caching** (remember results). The program counts how often the slow backend is actually called.

```java run Caching and protection proxies
import java.util.*;

public class Main {
    interface ProductCatalog { String price(String sku); }
    static class RemoteCatalog implements ProductCatalog {
        int calls = 0;
        public String price(String sku) { calls++; return "Rs "
                + (sku.hashCode() & 0xFFF); }
    }
    static class CachingProxy implements ProductCatalog {
        private final ProductCatalog real;
        private final Map<String, String> cache = new HashMap<>();
        CachingProxy(ProductCatalog real) { this.real = real; }
        public String price(String sku) { return cache.computeIfAbsent(sku, real::price); }
    }
    static class AdminOnlyProxy implements ProductCatalog {
        private final ProductCatalog real; private final String role;
        AdminOnlyProxy(ProductCatalog real, String role) {
                this.real = real; this.role = role; }
        public String price(String sku) {
            if (sku.startsWith("internal-") && !role.equals("admin"))
                throw new SecurityException("internal SKUs need admin role");
            return real.price(sku);
        }
    }

    public static void main(String[] args) {
        RemoteCatalog remote = new RemoteCatalog();
        ProductCatalog catalog = new CachingProxy(remote);
        for (String sku : List.of("tv-55", "phone-x", "tv-55", "tv-55", "phone-x"))
            catalog.price(sku);
        System.out.println("5 lookups, backend calls: " + remote.calls);
        try {
            new AdminOnlyProxy(catalog, "customer").price("internal-cost-sheet");
        } catch (SecurityException e) {
            System.out.println("blocked: " + e.getMessage());
        }
    }
}
```

> NOTE: Proxy and Decorator have the same structure. The difference is intent: a decorator **adds** behaviour the client asked for (compression); a proxy **controls access** to the same behaviour (caching, security, laziness), often without the client knowing it is there.

## 4.4 Facade

A facade gives one simple method for a common workflow over a complex subsystem. The "leaving home" scene below coordinates four smart-home subsystems. Clients call one method; the subsystems remain available for advanced use.

```java run A smart-home facade
import java.util.*;

public class Main {
    static class Lights { String allOff() { return "lights off"; } }
    static class Thermostat { String eco(int c) { return "thermostat eco " + c + "C"; } }
    static class Security { String arm() { return "alarm armed"; } }
    static class SmartPlugs {
        String off(List<String> ids) { return "plugs off " + ids; }
    }

    static class HomeFacade {
        private final Lights lights = new Lights();
        private final Thermostat thermo = new Thermostat();
        private final Security security = new Security();
        private final SmartPlugs plugs = new SmartPlugs();
        List<String> leaveHome() {
            return List.of(lights.allOff(), plugs.off(List.of("geyser", "tv")),
                    thermo.eco(28),
                           security.arm());
        }
    }

    public static void main(String[] args) {
        new HomeFacade().leaveHome().forEach(step -> System.out.println("- " + step));
    }
}
```

## 4.5 Composite

Composite lets you treat a single object and a group of objects through the same interface. A folder's size is the sum of its children's sizes, whether they are files or folders, so client code never checks types.

```java run Files and folders as a composite
import java.util.*;

public class Main {
    interface Node { String name(); long size(); void print(String indent); }
    record FileNode(String name, long size) implements Node {
        public void print(String in) { System.out.println(in + name + " (" + size
                + " KB)"); }
    }
    static class Folder implements Node {
        private final String name; private final List<Node> children = new ArrayList<>();
        Folder(String name, Node... kids) {
                this.name = name; children.addAll(List.of(kids)); }
        public String name() { return name; }
        public long size() { return children.stream().mapToLong(Node::size).sum(); }
        public void print(String in) {
            System.out.println(in + name + "/ (" + size() + " KB)");
            children.forEach(c -> c.print(in + "   "));
        }
    }

    public static void main(String[] args) {
        Folder root = new Folder("project",
                new FileNode("README.md", 4),
                new Folder("src", new FileNode("Main.java", 12), new FileNode("Util.java",
                        8),
                        new Folder("test", new FileNode("MainTest.java", 6))),
                new Folder("docs", new FileNode("design.pdf", 820)));
        root.print("");
    }
}
```

## 4.6 Bridge

When a class varies along two independent dimensions, inheritance multiplies classes: three remotes × four devices = twelve subclasses. Bridge splits the dimensions into two hierarchies connected by composition: 3 + 4 classes, and each can grow on its own.

```java run Remotes and devices as a bridge
import java.util.*;

public class Main {
    interface Device {
        String name(); int volume(); void setVolume(int v);
        boolean on(); void power(boolean b);
    }
    static class Tv implements Device {
        int vol = 10; boolean on;
        public String name() { return "TV"; }
        public int volume() { return vol; }
        public void setVolume(int v) { vol = Math.max(0, Math.min(100, v)); }
        public boolean on() { return on; }
        public void power(boolean b) { on = b; }
    }
    static class Speaker extends Tv { public String name() { return "Speaker"; } }

    static class Remote {   // abstraction holds an implementor
        protected final Device d;
        Remote(Device d) { this.d = d; }
        void toggle() { d.power(!d.on()); }
        void volumeUp() { d.setVolume(d.volume() + 10); }
        String status() { return d.name() + " on=" + d.on() + " vol=" + d.volume(); }
    }
    static class AdvancedRemote extends Remote {           // refines the abstraction only
        AdvancedRemote(Device d) { super(d); }
        void mute() { d.setVolume(0); }
    }

    public static void main(String[] args) {
        Remote basic = new Remote(new Tv());
        basic.toggle(); basic.volumeUp();
        System.out.println(basic.status());
        AdvancedRemote adv = new AdvancedRemote(new Speaker());
        adv.toggle(); adv.volumeUp(); adv.mute();
        System.out.println(adv.status());
    }
}
```

## 4.7 Flyweight

When you need millions of small objects, split their state into **intrinsic** state (shared and immutable: the tree species, its texture and colour) and **extrinsic** state (unique per object: x, y). A factory hands out shared flyweights for the intrinsic part.

```java run A forest of a million trees, three tree types
import java.util.*;

public class Main {
    record TreeType(String species, String colour, String texture) {}   // intrinsic, shared
    static class TreeTypeFactory {
        private static final Map<String, TreeType> cache = new HashMap<>();
        static TreeType get(String species, String colour, String texture) {
            return cache.computeIfAbsent(species + "|" + colour + "|" + texture,
                    k -> new TreeType(species, colour, texture));
        }
        static int created() { return cache.size(); }
    }
    record Tree(int x, int y, TreeType type) {}   // extrinsic + reference

    public static void main(String[] args) {
        String[][] kinds = {{"neem", "green", "rough.png"}, {"mango", "dark-green",
                "smooth.png"},
                            {"gulmohar", "red", "flower.png"}};
        Random rnd = new Random(1);
        List<Tree> forest = new ArrayList<>();
        for (int i = 0; i < 1_000_000; i++) {
            String[] k = kinds[rnd.nextInt(kinds.length)];
            forest.add(new Tree(rnd.nextInt(10_000), rnd.nextInt(10_000),
                    TreeTypeFactory.get(k[0], k[1], k[2])));
        }
        System.out.println("trees: " + forest.size() + ", TreeType objects: "
                + TreeTypeFactory.created());
        System.out.println("same flyweight shared? "
                + (TreeTypeFactory.get("neem", "green",
                        "rough.png") == TreeTypeFactory.get("neem", "green", "rough.png")));
    }
}
```

Java's own `Integer.valueOf` (for −128 to 127) and string interning are flyweights. The pattern only pays off with very many objects that share most of their state.

## 4.8 Practical lessons

- Adapter changes an interface; Decorator adds behaviour with the same interface; Proxy controls access with the same interface; Facade simplifies many interfaces into one.
- Composite: one interface for leaves and containers, recursion for totals.
- Bridge: two independent dimensions means two hierarchies joined by composition.
- Flyweight: share immutable intrinsic state, pass extrinsic state in.
- In interviews, name a real JDK or framework example for each; it shows you recognise the pattern in the wild.
