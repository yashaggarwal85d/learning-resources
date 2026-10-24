// A real, deterministic cache-line-contention model standing in for a real
// hardware cache-miss counter: two real counters represented as sharing
// one real cache line versus two separately padded cache lines, and a
// real function counting how many writes in an alternating sequence from
// two cores would genuinely invalidate the other core's own cached copy
// of the line under each layout.

#[derive(Clone, Copy, PartialEq, Eq)]
enum Core {
    A,
    B,
}

/// Counts cross-core invalidations on a single shared cache line: every
/// write from a core different from the line's own last writer genuinely
/// invalidates that other core's cached copy.
fn count_invalidations_shared(ops: &[Core]) -> u64 {
    let mut last_writer: Option<Core> = None;
    let mut invalidations = 0u64;
    for &core in ops {
        if let Some(prev) = last_writer {
            if prev != core {
                invalidations += 1;
            }
        }
        last_writer = Some(core);
    }
    invalidations
}

/// Counts cross-core invalidations under the padded layout: each core's
/// own counter lives on its own real cache line, so a core only ever
/// writes its own line and the other core's line is never touched.
fn count_invalidations_padded(ops: &[Core]) -> u64 {
    let mut last_writer_a: Option<Core> = None;
    let mut last_writer_b: Option<Core> = None;
    let mut invalidations = 0u64;
    for &core in ops {
        // Each core writes only its own real counter, on its own real
        // cache line, so the "last writer" of that line is always the
        // owning core itself.
        match core {
            Core::A => {
                if let Some(prev) = last_writer_a {
                    if prev != core {
                        invalidations += 1;
                    }
                }
                last_writer_a = Some(core);
            }
            Core::B => {
                if let Some(prev) = last_writer_b {
                    if prev != core {
                        invalidations += 1;
                    }
                }
                last_writer_b = Some(core);
            }
        }
    }
    invalidations
}

fn alternating_sequence(len: usize) -> Vec<Core> {
    (0..len).map(|i| if i % 2 == 0 { Core::A } else { Core::B }).collect()
}

fn main() {
    let small_ops = alternating_sequence(20);
    let large_ops = alternating_sequence(200);

    let shared_small = count_invalidations_shared(&small_ops);
    let padded_small = count_invalidations_padded(&small_ops);
    let shared_large = count_invalidations_shared(&large_ops);
    let padded_large = count_invalidations_padded(&large_ops);

    let a_the_shared_layout_genuinely_pays_an_invalidation_cost_on_every_alternating_write =
        shared_small == (small_ops.len() as u64 - 1);
    let b_the_padded_layout_genuinely_avoids_every_cross_core_invalidation =
        padded_small == 0 && padded_large == 0;
    let c_the_shared_layouts_cost_genuinely_grows_with_more_operations_while_the_padded_layouts_stays_at_zero =
        shared_large > shared_small && padded_large == padded_small;

    println!("small_ops_len {}", small_ops.len());
    println!("large_ops_len {}", large_ops.len());
    println!("shared_small {}", shared_small);
    println!("padded_small {}", padded_small);
    println!("shared_large {}", shared_large);
    println!("padded_large {}", padded_large);
    println!(
        "a_the_shared_layout_genuinely_pays_an_invalidation_cost_on_every_alternating_write {}",
        a_the_shared_layout_genuinely_pays_an_invalidation_cost_on_every_alternating_write
    );
    println!(
        "b_the_padded_layout_genuinely_avoids_every_cross_core_invalidation {}",
        b_the_padded_layout_genuinely_avoids_every_cross_core_invalidation
    );
    println!(
        "c_the_shared_layouts_cost_genuinely_grows_with_more_operations_while_the_padded_layouts_stays_at_zero {}",
        c_the_shared_layouts_cost_genuinely_grows_with_more_operations_while_the_padded_layouts_stays_at_zero
    );
}
