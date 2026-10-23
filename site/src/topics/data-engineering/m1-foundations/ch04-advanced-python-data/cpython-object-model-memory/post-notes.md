<section data-section="outcomes">

## Outcomes

Every Python object carries a reference count and a type pointer before a single byte of its
own value — on this sandbox's own interpreter, a list of boxed integers measured about four and
a half times heavier than the identical values packed into a native buffer. `__slots__` removes
a plain instance's per-instance dictionary outright, not just shrinks it, cutting a measured
three-field instance to a fraction of its boxed size. The specializing adaptive interpreter
rewrites a line's own bytecode once it sees what types actually show up — directly visible by
disassembling the same function cold and warm — and that adaptation has a real, measured cost
when the types keep changing. The experimental JIT (3.13+) sits past that, but only in a build
configured for it; this sandbox's own build is neither JIT-enabled nor free-threaded, checked
directly rather than assumed. Neither trick closes the gap a vectorized call skips from the
start: the same loop measured tens of times slower than an equivalent vectorized call on this
sandbox, even with the vectorized call's own first-call cost disclosed honestly rather than
hidden inside the headline number.

</section>

<section data-section="lab">

## Lab

Every number in this topic is measured directly on this sandbox's own CPython
(`examples.py`): the boxed-vs-packed byte ratio, the `__dict__`-vs-`__slots__` byte ratio, the
real disassembled bytecode before and after specialization for two argument types, a direct
check that this build has neither the experimental JIT nor free-threading enabled, a real
loop-vs-vectorized speedup (warmed up once before timing, with the first-call cost disclosed
separately), and the real extra cost of calling the same function with a genuine mix of argument
types instead of one consistent type.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that profiles a slow pipeline, finds a Python loop, and reaches for `__slots__` or a
newer Python version before checking whether the real cost is the loop being Python at all.**
`__slots__` and the specializing interpreter both measurably help, but neither one closes the
gap a vectorized call skips by not boxing values in the first place — this topic's own lab shows
both costs side by side, at real measured sizes.

**A team that assumes a feature exists because the Python version number is new enough.** The
experimental JIT and free-threading are both gated behind a build configuration, not a version
number alone; this sandbox's own CPython 3.13.16 build has neither, confirmed directly rather
than assumed, and a pipeline that silently depends on either without checking will behave
differently on a different build of the same version.

</section>

<section data-section="frontier">

## Frontier

The buffer protocol and zero-copy interchange (PEP 3118, the Arrow C Data Interface, DLPack) and
serialization costs in Python (`orjson`/`msgspec`, pickle, Avro/Protobuf) are both marked
`*(skipped)*` in this chapter's own syllabus and are not covered here, named only so the gap is
disclosed rather than silently dropped.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A boxed object's own overhead is the per-item cost; the next question is what actually stops more
than one CPU core from paying that cost in parallel at once — the GIL, and every real way around
it today.

</section>
