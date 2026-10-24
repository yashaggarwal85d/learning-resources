const NUM_ROWS: usize = 10_000;
const BATCH_SIZE: usize = 100;
const THRESHOLD: i64 = 500_000;

fn build_column(n: usize) -> Vec<i64> {
    // a simple xorshift generator, self-contained and deterministic, so
    // the column is reproducible without an external crate.
    let mut state = 0x2545_F491_4F6C_DD1Du64;
    (0..n)
        .map(|_| {
            let mut x = state;
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            state = x;
            (x % 1_000_000) as i64
        })
        .collect()
}

// a row-at-a-time path: one dispatch per row, the way a naive,
// tuple-at-a-time interpreter evaluates a filter one row at a time
// before summing it.
fn row_at_a_time_filter_sum(column: &[i64], threshold: i64) -> (i64, usize) {
    let mut sum = 0i64;
    let mut dispatches = 0usize;
    for &v in column {
        dispatches += 1; // one dispatch: evaluate this single row's own predicate
        if v > threshold {
            sum += v;
        }
    }
    (sum, dispatches)
}

// a vectorized, batch-at-a-time path: one dispatch per batch, building
// that batch's own selection vector of matching row offsets, then a
// tight, vectorizable inner loop summing only the selected values; no
// further dispatch happens inside the batch.
fn vectorized_filter_sum(column: &[i64], threshold: i64, batch_size: usize) -> (i64, usize) {
    let mut sum = 0i64;
    let mut dispatches = 0usize;
    for batch in column.chunks(batch_size) {
        dispatches += 1; // one dispatch: build this whole batch's own selection vector
        let mut selection = Vec::with_capacity(batch.len());
        for (i, &v) in batch.iter().enumerate() {
            if v > threshold {
                selection.push(i);
            }
        }
        for &i in &selection {
            sum += batch[i];
        }
    }
    (sum, dispatches)
}

fn main() {
    let n = NUM_ROWS;
    let column = build_column(n);

    let (row_sum, row_dispatches) = row_at_a_time_filter_sum(&column, THRESHOLD);
    let (vec_sum, vec_dispatches) = vectorized_filter_sum(&column, THRESHOLD, BATCH_SIZE);

    let expected_dispatches = n.div_ceil(BATCH_SIZE);

    let dispatch_cut_factor = row_dispatches as f64 / vec_dispatches as f64;

    let a_vectorized_cuts_dispatch_overhead = dispatch_cut_factor > (BATCH_SIZE as f64) * 0.9;
    let b_results_match_exactly = row_sum == vec_sum;
    let c_dispatch_count_matches_batch_arithmetic = vec_dispatches == expected_dispatches;

    println!("row_sum {row_sum}");
    println!("vec_sum {vec_sum}");
    println!("row_dispatches {row_dispatches}");
    println!("vec_dispatches {vec_dispatches}");
    println!("expected_dispatches {expected_dispatches}");
    println!("dispatch_cut_factor {dispatch_cut_factor:.4}");
    println!("a_vectorized_cuts_dispatch_overhead {a_vectorized_cuts_dispatch_overhead}");
    println!("b_results_match_exactly {b_results_match_exactly}");
    println!(
        "c_dispatch_count_matches_batch_arithmetic {c_dispatch_count_matches_batch_arithmetic}"
    );
}
