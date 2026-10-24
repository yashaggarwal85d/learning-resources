# Sources — Embedding Rust in Python and JVM

## Parallelism — PyO3 user guide
URL: https://pyo3.rs/v0.29.0/parallelism.html
Fetched: 2026-10-24, cached at `sources/parallelism.txt`.

> The Python::detach method can be used to allow the Python interpreter to do other work while the Rust work is ongoing.

> To enable parallel execution of this function, the Python::detach method can be used to temporarily release the GIL, thus allowing other Python threads to run.

## PyByteArrayMethods — docs.rs
URL: https://docs.rs/pyo3/latest/pyo3/types/trait.PyByteArrayMethods.html
Fetched: 2026-10-24, cached at `sources/bytearray-trait.txt`.

> Extracts a slice of the ByteArray’s entire buffer.

Last verified: 2026-10-24. Expert sign-off: pending.
