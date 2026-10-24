Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, `examples/hot_transform/`): a real maturin build of a PyO3 extension, installed
into this interpreter; a three-way timing comparison against pure Python and Polars, asserted
equal before any clock is read; a real GIL-held-vs-GIL-released counter measurement; two real
builds producing two real, differently named wheel files; a real, directly checked read of this
interpreter's own free-threading build flag.

- pandera, "Data Validation with Polars": [pandera.readthedocs.io](https://pandera.readthedocs.io/en/stable/polars.html). Polars' own core named directly as Rust.
- Pydantic, "Pydantic Validation": [docs.pydantic.dev](https://docs.pydantic.dev/latest/). pydantic-core named directly as Rust, the stated reason for its speed.
- orjson, README: [github.com/ijl/orjson](https://raw.githubusercontent.com/ijl/orjson/master/README.md). The Rust/maturin packaging requirement and the real multi-platform wheel matrix.
- PyO3, "Parallelism": [pyo3.rs](https://pyo3.rs/v0.22.0/parallelism). The GIL's effect on threaded code and `Python::allow_threads` as the release mechanism.
- PyO3, "Building and distribution": [pyo3.rs](https://pyo3.rs/v0.22.0/building-and-distribution). The abi3 limited API, the `abi3-pyXY` feature flag, and the real `cp3X-abi3` wheel naming.
- Python docs, "Python support for free threading": [docs.python.org](https://docs.python.org/3/howto/free-threading-python.html). Free-threaded CPython as an optional 3.13+ build, and the real way to check for it.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=native-extensions-rust-pyo3:%20).
