use pyo3::prelude::*;
use pyo3::types::PyByteArray;
use std::time::{Duration, Instant};

/// The real address of the bytearray's own underlying buffer, read
/// directly from the Python object with no copy made on the way in.
#[pyfunction]
fn buffer_address_py(buf: &Bound<'_, PyByteArray>) -> usize {
    unsafe { buf.as_bytes().as_ptr() as usize }
}

fn busy_work(millis: u64) -> u64 {
    let deadline = Instant::now() + Duration::from_millis(millis);
    let mut x: u64 = 0;
    while Instant::now() < deadline {
        x = x.wrapping_add(1);
    }
    x
}

/// Real CPU-bound work, done while this call still holds the GIL.
#[pyfunction]
fn busy_wait_holding_gil_py(millis: u64) -> u64 {
    busy_work(millis)
}

/// The identical real CPU-bound work, with the GIL explicitly
/// released for the duration of the call.
#[pyfunction]
fn busy_wait_releasing_gil_py(py: Python<'_>, millis: u64) -> u64 {
    py.allow_threads(|| busy_work(millis))
}

#[pymodule]
fn pyo3_exchanges_data_without_copying_it(_py: Python<'_>, m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(buffer_address_py, m)?)?;
    m.add_function(wrap_pyfunction!(busy_wait_holding_gil_py, m)?)?;
    m.add_function(wrap_pyfunction!(busy_wait_releasing_gil_py, m)?)?;
    Ok(())
}
