<section data-section="outcomes">

## Outcomes

Two of this chapter's own fast libraries — a dataframe library and a validation library — name
Rust directly as their own core in their own documentation, not inferred from outside claims. A
real PyO3 extension, built fresh for this topic with a real `maturin build --release
--interpreter sys.executable` followed by a real `pip install`, is a genuine `import`-able module
whose function returns a result that exactly matches an independently computed pure-Python and
Polars result on the same two million generated prices, measured 3–4x faster than the pure-Python
path across repeated runs. Releasing the GIL from inside that same extension via
`py.allow_threads` lets a separate, counting Python thread make roughly 20–25x more real progress
in the same span than it does while the GIL stays held — measured directly, not assumed from the
mechanism's own documentation. One `abi3` feature flag, applied to the identical source, produces
a second, differently named wheel file (`cp39-abi3-...` next to the per-version build's
`cp313-cp313-...`) rather than just a label applied after the fact. And this sandbox's own
interpreter, asked directly via `sysconfig.get_config_var("Py_GIL_DISABLED")`, confirms it is the
standard build rather than the optional free-threaded one — a real, checked fact rather than a
guess from the Python version number alone.

</section>

<section data-section="lab">

## Lab

Hosts the §4.3 chapter lab directly (per `CHAPTER.md`): the shop's own hot transformation — the
same normalize-and-sum shape this chapter already ran in pure Python and in Polars — moved into a
real PyO3 extension (`examples/hot_transform/`), built with maturin on the sandbox's own Rust
toolchain, and benchmarked for real against both of those existing paths. `examples.py` runs
every measurement it claims: a real build-and-install round trip; a real three-way timing
comparison asserted equal before any clock is read; a real GIL-held-vs-GIL-released counter
measurement; two real builds producing two real, differently named wheel files; and a real,
directly checked read of this interpreter's own free-threading build flag.

</section>

<section data-section="production">

## Production failures this topic warns about

**Shipping a per-version wheel when an abi3 wheel would have cost nothing extra.** This topic's
own "Prove it" scenario is the real failure mode: a team that built and shipped a wheel tied to
one exact interpreter version now needs three more versions covered, and each one means another
full build-and-test cycle their own earlier choice made unnecessary. Choosing `abi3` from the
first build, at the cost of a few version-specific optimizations, would already have covered every
version from its declared minimum upward.

**Assuming a lock release is a formality because the code "looks the same" either way.** Code that
wraps a call in `py.allow_threads` and code that doesn't look nearly identical from the Python
side; only a real measurement of a waiting thread's own progress — the 20x-plus gap this topic
measured directly — tells you whether the release actually changed anything.

**Inferring free-threading support from a Python version number instead of asking the interpreter
directly.** Free-threaded CPython is an optional build, not a property every copy of Python 3.13
or later automatically has. This topic's own `sysconfig.get_config_var("Py_GIL_DISABLED")` check
is the real way to know, and a C extension not marked as free-threading-safe can silently re-enable
the GIL even on a build that does have it.

</section>

<section data-section="frontier">

## Frontier

The sourced documentation goes further than this sandbox can directly check: a C extension that
hasn't declared itself free-threading-safe can cause the GIL to be re-enabled even on an
interpreter built with it removable, a behavior this topic names and sources rather than
reproduces, since this sandbox's own CPython isn't a free-threaded build to begin with. The deeper
half of the abi3 claim — that the same wheel keeps working, unmodified, as still-unreleased future
Python versions ship — also rests on the documentation's own description of the limited API rather
than on installing versions that don't exist yet.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every acceleration in this chapter — profiling, Arrow, Polars, a hand-built PyO3 extension — still
assumed a database engine already existed underneath, already written in C or Rust. Next chapter
opens that engine itself, starting from the single fixed-size page every one of them reads and
writes.

</section>
