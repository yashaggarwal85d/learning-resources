# Outline — de.native-extensions-rust-pyo3

## Learning outcomes

1. Name, with direct evidence, which of this chapter's own libraries (Polars, Pydantic's
   pydantic-core, an ADBC driver) are actually Rust or C++ underneath.
2. Build and import a real PyO3 extension with maturin.
3. Release the GIL inside that extension for a genuinely parallel section and show the real
   measured effect.
4. Name what abi3 buys for multi-platform wheels and what a free-threading-capable build
   additionally requires, the latter honestly as sourced-only since the sandbox's CPython is
   3.13.

## Reel steps (storyboard)

1. **Hook: every library this chapter leaned on for speed — what's actually running underneath?**
   - `fig`: "Polars, Pydantic's validation core, the ADBC driver — this chapter called all three fast. What are they actually written in?"
   - Visual: "Polars, Pydantic's core" / "named, this chapter" vs. "what's underneath" / "not yet shown".
   - Narrator's line: names the real handoff (speed was assumed throughout; this topic opens what it's actually built from).

2. **Reveal: the libraries this chapter leaned on, named directly**
   - `fig`: "Polars' own documentation, Pydantic's own documentation — what do they say they're written in?"
   - Visual: "Polars' own docs" / "names Rust directly" vs. "Pydantic's own docs" / "names Rust directly".
   - Takeaway: two libraries this chapter already used for speed both name Rust directly as their own core, not assumed from outside.

3. **Reveal: a real PyO3 extension, built and imported**
   - `fig`: "a Rust function, compiled into Python with one build tool — does the import actually work?"
   - Visual: "a Rust function" / "compiled, real build" vs. "import, call it" / "returns a real result".
   - Takeaway: a PyO3 extension isn't a packaging format for Rust code — it's a real build that a plain `import` loads and calls.

4. **Reveal: the same computation, three ways, measured**
   - `fig`: "the identical transformation, run as pure Python, as a compiled extension, and as a Polars expression — how do the real times compare?"
   - Visual: "pure Python" / "a measured time" vs. "the PyO3 extension" / "measurably faster".
   - Takeaway: the exact same computation, measured three ways, confirms the extension is doing real, non-trivial work faster, not just moving overhead around.

5. **Predict: does releasing the GIL inside a Rust extension actually let Python keep working?** (within first four ✓)
   - `fig`: "a Rust extension explicitly releases the GIL mid-call — does a separate Python thread actually get to run, or is that just a formality?"
   - Options: "No — releasing the GIL from Rust is mostly a formality; Python still waits" / "Yes — a separate Python thread makes real, measurable progress" (correct).
   - Explain: releasing the GIL from inside a Rust extension isn't a formality — a separate Python thread genuinely executes real work during that window, measured directly rather than assumed.

6. **Reveal: the GIL released, measured directly**
   - `fig`: "the identical busy work, once holding the GIL and once releasing it — how much does a separate Python thread actually get done?"
   - Visual: "GIL held" / "a small count" vs. "GIL released" / "a far larger count".
   - Takeaway: releasing the GIL isn't a formality — a separate Python thread does measurably more real work while it's released than while it's held.

7. **Reveal: one feature flag, two real wheels**
   - `fig`: "the identical extension, built once per-version and once as abi3 — do the two wheel files actually differ, or is abi3 just a label?"
   - Visual: "per-version build" / "tagged to this exact version" vs. "abi3 build" / "tagged for every version from here up".
   - Takeaway: abi3 isn't a label applied after the fact — one feature flag produces a genuinely different wheel, tagged for a whole range of future Python versions.

8. **Reveal: what this sandbox's own interpreter actually is, checked rather than assumed**
   - `fig`: "this sandbox's own interpreter, checked directly — is it actually a free-threaded build, or not?"
   - Visual: "checked directly" / "a standard build" vs. "a free-threaded build" / "would need its own binary".
   - Takeaway: whether an interpreter is free-threading-capable is a real, checkable fact about that build — not assumed from the Python version number alone.

9. **Recap**
10. **Prove it** — a production scenario: a team builds a PyO3 extension, ships it as a single per-version wheel for their one deployment target, and later needs it to run unmodified on three more Python versions without multiplying their build matrix. What should they have done differently, and why does today's exact choice between the two wheel-building options matter now?

## Engagement arc

- Hook names the real open question: speed was assumed all chapter; this topic opens what it's actually built from.
- Early predict (step 5) tests the intuition that releasing the GIL from Rust is mostly ceremonial — it isn't, and the reveal shows the real measured effect directly.
- Steps 2–4 build the "Rust underneath" claim and the extension-building claim with real, run evidence.
- Steps 6–8 build the GIL-release, abi3, and free-threading claims, each with a real measurement or a real checked fact, the last one disclosed honestly about this sandbox's own limits.
- Recap ties every claim back to its own real evidence; Prove It makes the abi3-vs-per-version tradeoff concrete for a team that chose wrong upfront.

## Post-notes headings

- Outcomes
- Lab
- Production failures this topic warns about
- Frontier
- Where this goes next

## Claims (drawn from the six verified sources)

1. Polars' own core is written in Rust, with Python as one of its SDKs. (Data Validation with Polars / pandera, quoting Polars' own framing)
2. Pydantic's core validation logic is written in Rust, the stated reason for its speed. (Pydantic Validation)
3. orjson requires Rust and the maturin build tool to package; it distributes real wheels across multiple CPU architectures and three operating systems. (orjson README)
4. The GIL prevents several Python threads from executing Python bytecode in parallel; `Python::allow_threads` is PyO3's mechanism to release it for real parallel work. (Parallelism, PyO3 user guide)
5. The abi3 limited API lets package vendors ship one wheel that works across multiple Python versions, at the cost of some PyO3 optimizations that need an exact version. (Building and distribution, PyO3 user guide)
6. An `abi3-pyXY` feature flag sets a wheel's minimum supported Python version; maturin names the resulting wheel `cp3X-abi3-...`. (Building and distribution, PyO3 user guide)
7. Free-threaded CPython is an optional build starting in Python 3.13; `sys._is_gil_enabled()` and `sysconfig.get_config_var("Py_GIL_DISABLED")` are the real ways to check it. (Python support for free threading)
8. A C-extension not explicitly marked as supporting free threading can cause the GIL to be re-enabled even on a free-threaded build. (Python support for free threading)
