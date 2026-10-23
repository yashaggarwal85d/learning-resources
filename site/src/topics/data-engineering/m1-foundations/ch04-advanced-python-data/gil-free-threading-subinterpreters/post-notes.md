<section data-section="outcomes">

## Outcomes

Only one thread executes Python bytecode at a time, by design — but native code that explicitly
releases the GIL during its own computation genuinely runs alongside other threads, measured
directly against a pure-Python loop that shows almost no speedup at all. Multiprocessing avoids
the GIL entirely by using separate processes, but at a real, measured cost: a fork child inherits
the parent's memory directly and starts fast, while a spawn or forkserver child starts a fresh
interpreter, never sees what the parent already had, and pays a real pickling cost for anything
it does need handed over. Free-threaded CPython removes the GIL from a single process, but its
own governing proposal discloses a real single-thread performance penalty, real added memory
use, and a real C-extension-compatibility cost up front, not hidden in the pitch. Subinterpreters
offer a fourth path — isolated interpreters, each with its own GIL, measured to deliver real
multi-core parallelism for pure Python work once actually driven by threads of their own.

</section>

<section data-section="lab">

## Lab

Every number in this topic is measured directly on this sandbox's own CPython 3.13.16
(`examples.py`): `fork` vs. `spawn`/`forkserver` pool startup time; the real RSS difference
between a fork child (confirmed, via a direct attribute check, to inherit a parent's large list)
and a spawn child (confirmed to genuinely not have it); a real pickling round-trip cost on a
hundred-thousand-row structure; `hashlib`'s own GIL-releasing speedup across threads against an
equivalent pure-Python loop's lack of one; and genuine multi-core parallelism from the low-level
`_interpreters` module, since this sandbox's 3.13 doesn't have the higher-level
`concurrent.interpreters` module (3.14) that wraps it.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that reaches for `multiprocessing` to speed up CPU-bound work without checking whether
the work is actually CPU-bound, or whether its inputs are even picklable.** This topic's own
pickling-cost measurement and the `AttributeError` this build's own research hit when a
multiprocessing worker wasn't a real, importable module-level function both show the same
lesson: a process boundary isn't free, and `spawn`/`forkserver` specifically require everything
crossing it to be serializable.

**A team that assumes removing the GIL is a pure win, with no cost anywhere.** PEP 779's own
disclosed single-thread penalty and memory overhead, plus PEP 703's own disclosed C-extension
compatibility cost, say otherwise directly — this topic's own predict step and its explanation
are built around exactly that trap.

</section>

<section data-section="frontier">

## Frontier

`asyncio` and cooperative concurrency for I/O-bound work are intentionally left for the next
topic, since none of this topic's CPU-bound machinery — multiprocessing, native GIL release,
free-threading, subinterpreters — is the right tool for work that spends its time waiting on the
network rather than burning a core.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism here answers CPU-bound parallelism. The next question is the other half of
concurrency entirely: work that isn't CPU-bound at all, but spends almost all its time waiting on
the network — where none of this topic's machinery is even the right tool.

</section>
