## Data Validation with Polars (pandera)

URL: https://pandera.readthedocs.io/en/stable/polars.html
Version: pandera stable docs (fetched 2026-10-24)

> Polars is a blazingly fast DataFrame library for manipulating structured data. Since the core is written in Rust, you get the performance of C/C++ while providing SDKs in other languages like Python.

Contents: Polars' own core named directly as Rust, with Python as one of its SDKs.

## Pydantic Validation

URL: https://docs.pydantic.dev/latest/
Version: v2.14.1 docs (fetched 2026-10-24)

> Speed — Pydantic's core validation logic is written in Rust. As a result, Pydantic is among the fastest data validation libraries for Python.

Contents: pydantic-core named directly as Rust, cited as the reason for Pydantic v2's speed.

## orjson README

URL: https://raw.githubusercontent.com/ijl/orjson/master/README.md
Version: orjson GitHub README (fetched 2026-10-24)

> orjson is a fast, correct JSON library for Python.

> To package orjson requires at least [Rust](https://www.rust-lang.org/) 1.95,

> It distributes amd64/x86_64/x64, i686/x86, aarch64/arm64/armv8, and armv7 wheels for Linux, amd64 and aarch64 wheels for macOS, and amd64, i686, and aarch64 wheels for Windows.

Contents: orjson's own packaging section naming Rust and maturin as its build requirement directly; its real wheel matrix across architectures and operating systems, the concrete shape of "multi-platform wheels."

## Parallelism (PyO3 user guide)

URL: https://pyo3.rs/v0.22.0/parallelism
Version: PyO3 v0.22.0 user guide (fetched 2026-10-24)

> CPython has the infamous Global Interpreter Lock, which prevents several threads from executing Python bytecode in parallel.

> To enable parallel execution of this function, the Python::allow_threads method can be used to temporarily release the GIL, thus allowing other Python threads to run.

Contents: the GIL's effect on threaded Python code; `Python::allow_threads` as the mechanism PyO3 extensions use to release it for real parallel work.

## Building and distribution (PyO3 user guide)

URL: https://pyo3.rs/v0.22.0/building-and-distribution
Version: PyO3 v0.22.0 user guide (fetched 2026-10-24)

> Package vendors can opt-in to the "abi3" limited Python API which allows their wheels to be used on multiple Python versions, reducing the number of wheels they need to compile, but restricts the functionality they can use.

> Enable the abi3 feature in pyo3. This ensures pyo3 only calls Python C-API functions which are part of the stable API

> maturin and setuptools-rust will give the wheel a name like my-extension-1.0-cp37-abi3-manylinux2020_x86_64.whl.

Contents: abi3 as the limited/stable Python C API, letting one compiled wheel cover multiple Python versions; the `abi3-pyXY` feature flags setting the minimum version; the real `cp3X-abi3` wheel filename shape.

## Python support for free threading

URL: https://docs.python.org/3/howto/free-threading-python.html
Version: Python 3.15.1 docs (fetched 2026-10-24)

> Starting with Python 3.13, the official macOS and Windows installers optionally support installing free-threaded Python binaries.

> The new sys._is_gil_enabled() function can be used to check whether the GIL is actually disabled in the running process.

> The sysconfig.get_config_var("Py_GIL_DISABLED") configuration variable can be used to determine whether the build supports free threading.

> Some third-party packages, in particular ones with an extension module, may not be ready for use in a free-threaded build, and will re-enable the GIL.

Contents: free-threaded CPython as an optional build starting in 3.13; `sys._is_gil_enabled()` and `Py_GIL_DISABLED` as the real way to detect it; C-extension compatibility as the gating factor the syllabus names directly.
