use pyo3::prelude::*;
use std::thread;
use std::time::{Duration, Instant};

/// The shop's hot transformation: normalize a price list to cents and sum it.
/// A real, non-trivial per-element computation, run in a tight loop.
fn normalize_and_sum(prices: &[f64]) -> i64 {
    prices.iter().map(|p| (p * 100.0).round() as i64).sum()
}

#[pyfunction]
fn normalize_and_sum_py(prices: Vec<f64>) -> i64 {
    normalize_and_sum(&prices)
}

/// Same computation, releasing the GIL for the Rust work, then split across real
/// OS threads to show genuinely parallel execution once the GIL is out of the way.
#[pyfunction]
fn normalize_and_sum_parallel_py(py: Python<'_>, prices: Vec<f64>, num_threads: usize) -> i64 {
    py.allow_threads(|| {
        let chunk_size = (prices.len() / num_threads).max(1);
        let mut handles = Vec::new();
        for chunk in prices.chunks(chunk_size) {
            let chunk = chunk.to_vec();
            handles.push(thread::spawn(move || normalize_and_sum(&chunk)));
        }
        handles.into_iter().map(|h| h.join().unwrap()).sum()
    })
}

fn busy_work(millis: u64) -> u64 {
    let deadline = Instant::now() + Duration::from_millis(millis);
    let mut x: u64 = 0;
    while Instant::now() < deadline {
        x = x.wrapping_add(1);
    }
    x
}

/// The identical busy loop, called while still holding the GIL the whole time.
#[pyfunction]
fn busy_wait_holding_gil_py(millis: u64) -> u64 {
    busy_work(millis)
}

/// The identical busy loop, with the GIL explicitly released for its duration.
#[pyfunction]
fn busy_wait_releasing_gil_py(py: Python<'_>, millis: u64) -> u64 {
    py.allow_threads(|| busy_work(millis))
}

#[pymodule]
fn hot_transform(_py: Python<'_>, m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(normalize_and_sum_py, m)?)?;
    m.add_function(wrap_pyfunction!(normalize_and_sum_parallel_py, m)?)?;
    m.add_function(wrap_pyfunction!(busy_wait_holding_gil_py, m)?)?;
    m.add_function(wrap_pyfunction!(busy_wait_releasing_gil_py, m)?)?;
    Ok(())
}
