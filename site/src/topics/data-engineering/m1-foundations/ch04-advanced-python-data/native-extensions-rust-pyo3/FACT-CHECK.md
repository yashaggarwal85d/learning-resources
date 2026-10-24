# Fact-check — de.native-extensions-rust-pyo3

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Polars' own core is written in Rust, with Python as one of its SDKs. | Confirmed | `sources/pandera-polars.txt` (quoting Polars' own framing), quoted verbatim. |
| 2 | Pydantic's core validation logic is written in Rust, the stated reason for its speed. | Confirmed | `sources/pydantic-overview.txt`, quoted verbatim. |
| 3 | orjson requires Rust and the maturin build tool to package; it distributes real wheels across multiple CPU architectures and three operating systems. | Confirmed | `sources/orjson-readme.txt`, quoted verbatim. |
| 4 | The GIL prevents several Python threads from executing Python bytecode in parallel; `Python::allow_threads` is PyO3's own mechanism to release it. | Confirmed | `sources/pyo3-parallelism.txt`, quoted verbatim. |
| 5 | The abi3 limited API lets one wheel work across multiple Python versions, at the cost of some version-specific PyO3 optimizations. | Confirmed | `sources/pyo3-building-distribution.txt`, quoted verbatim. |
| 6 | An `abi3-pyXY` feature flag sets the minimum Python version; maturin names the wheel `cp3X-abi3-...`. | Confirmed | `sources/pyo3-building-distribution.txt`, quoted verbatim; reproduced directly — a real build names its wheel exactly `hot_transform-0.1.0-cp39-abi3-manylinux_2_34_x86_64.whl`. |
| 7 | Free-threaded CPython is an optional build starting in Python 3.13; `sys._is_gil_enabled()` and `Py_GIL_DISABLED` are the real way to check it. | Confirmed | `sources/python-free-threading.txt`, quoted verbatim; reproduced directly — `sysconfig.get_config_var("Py_GIL_DISABLED")` returns `0` in this sandbox. |
| 8 | A C-extension not marked as free-threading-safe can cause the GIL to be re-enabled even on a free-threaded build. | Confirmed | `sources/python-free-threading.txt`, quoted verbatim; not reproduced directly, since this sandbox's own CPython isn't a free-threaded build to begin with (see claim 7 and the Problem Solving note below). |
| 9 | A real PyO3 extension, built with maturin against this interpreter, is a genuine `import`-able module whose function returns a correct, verified result. | Confirmed, direct measurement | `examples.py`; `hot_transform.normalize_and_sum_py(...)` returns a result that exactly matches the independently computed pure-Python and Polars results on the same input. |
| 10 | The identical computation runs measurably faster as a compiled PyO3 extension than as pure Python, on the order of the chapter's other native-vs-Python comparisons. | Confirmed, direct measurement | `examples.py`; the extension consistently measured 3–4x faster than pure Python across repeated runs on two million generated prices. |
| 11 | Releasing the GIL from inside a Rust extension lets a separate Python thread make real, measurably greater progress during that window, not a formality. | Confirmed, direct measurement | `examples.py`; a counter-incrementing Python thread made roughly 20–25x more increments during a GIL-released busy-wait than during an identical GIL-held one, across repeated runs. |
| 12 | The identical extension, built once per-version and once with the `abi3` feature, produces two real, differently named wheel files. | Confirmed, direct measurement | `examples.py`; the per-version build's log names a `cp313-cp313-...` wheel and the abi3 build's log names a `cp39-abi3-...` wheel in the same run. |

## Red team

- **Is the "Rust underneath" claim actually about this chapter's own libraries, or borrowed from elsewhere?** Both quoted claims (Polars, Pydantic) come from sources this chapter already cited and relied on for other topics' own speed claims (the Polars topic, the schema-validation topic), not fresh, unrelated sources — the same libraries this chapter already called fast, now shown what they're built from. orjson is new to this topic specifically because the syllabus names it directly alongside Polars and pydantic-core, and its own README states the Rust/maturin requirement in its own packaging section, not inferred from elsewhere.
- **Does the three-way speed comparison (pure Python, PyO3, Polars) fairly represent the claim, or stack the deck?** All three paths compute the identical transformation (multiply by a hundred, round, sum) over the identical generated input, and the result is asserted equal across all three before any time is reported — ruling out the uninteresting case where a faster path got there by computing something slightly different. Polars is included not to be beaten but to show where the hand-built extension actually lands relative to a mature native library already in the chapter.
- **Does the GIL-release measurement actually isolate the GIL, or something else?** `busy_wait_holding_gil_py` and `busy_wait_releasing_gil_py` run the identical Rust busy-loop for the identical duration, differing only in whether `py.allow_threads` wraps the call — the only variable changed is whether the GIL is held, confirmed by the roughly 20x-plus gap in how much a separate, otherwise-identical Python thread gets done.
- **Is "two different wheel filenames" actually the whole abi3 story, or just the most visible part?** The filename difference is real and directly observed, but the deeper claim — a single abi3 wheel keeps working as newer Python versions ship, while a per-version wheel does not — isn't something this sandbox can verify by installing future, unreleased Python versions. That part of the claim rests on the sourced documentation's own description of the mechanism (the limited/stable C API), disclosed as sourced rather than independently re-verified here.
- **Predict question (step 5) wrong-answer trap.** The tempting wrong answer ("releasing the GIL from Rust is mostly a formality") plays on the fact that most Python code never bothers to release the GIL explicitly and the language gets by fine without it, while missing that PyO3's `allow_threads` genuinely drops CPython's own lock for that call's duration — the reveal's own counter measurement is the direct evidence that it isn't just a documented formality.

## Problem Solving

The free-threading claim (outcome 4's second half) was scoped down from what a first draft of
the outline implied. An early plan considered actually building and testing the extension
against a free-threaded CPython 3.13 or 3.14 binary to directly measure the C-extension-
compatibility gating factor the syllabus names — but this sandbox's only installed CPython is
the standard, non-free-threaded 3.13.16 build (confirmed via `sysconfig.get_config_var(
"Py_GIL_DISABLED")` returning `0`, not assumed from the version number), and installing a second
free-threaded interpreter build was judged out of scope for a single-session topic build. The
outcome was narrowed to what this sandbox can actually confirm directly — this interpreter's own
build is not free-threaded — with the free-threading mechanism itself (optional installers,
`sys._is_gil_enabled()`, the re-enable-on-incompatible-extension behavior) named and sourced
rather than independently re-measured, following the same sourced-only disclosure pattern
`CHAPTER.md` itself calls for on this exact outcome.
