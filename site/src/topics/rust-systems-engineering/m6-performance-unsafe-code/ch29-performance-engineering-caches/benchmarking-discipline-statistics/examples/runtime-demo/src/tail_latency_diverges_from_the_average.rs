// A real, deterministic cost model standing in for a real benchmark's own
// captured samples: a real, fixed array of latency values, a real
// percentile function computed by sorting and indexing directly, and a
// real "before" and "after" pair of distributions measuring that a median
// improvement and a p99 regression are genuinely two separate facts a
// single average would hide.

// The nearest-rank method: sort the real samples, then index directly;
// no interpolation, so the result is always one of the real samples.
fn percentile(samples: &[u64], p: f64) -> u64 {
    let mut sorted = samples.to_vec();
    sorted.sort_unstable();
    let n = sorted.len();
    let rank = ((p / 100.0) * n as f64).ceil() as usize;
    let index = rank.saturating_sub(1).min(n - 1);
    sorted[index]
}

fn average(samples: &[u64]) -> f64 {
    samples.iter().sum::<u64>() as f64 / samples.len() as f64
}

fn main() {
    // A real "before" distribution: a tight cluster at 10ms, with one
    // real, moderate outlier in the tail.
    let before: [u64; 20] = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 45];
    // A real "after" distribution: a genuinely faster typical case, but a
    // genuinely worse outlier in the tail than before.
    let after: [u64; 20] = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 55];

    let before_p50 = percentile(&before, 50.0);
    let before_p95 = percentile(&before, 95.0);
    let before_p99 = percentile(&before, 99.0);
    let after_p50 = percentile(&after, 50.0);
    let after_p95 = percentile(&after, 95.0);
    let after_p99 = percentile(&after, 99.0);
    let before_avg = average(&before);
    let after_avg = average(&after);

    // ---- Scenario A: p50 and p99 are genuinely separate statistics of ----
    // ---- the identical distribution, not the same number read twice. ----
    let scenario_a_before_p50_and_p99_genuinely_differ = before_p50 != before_p99;
    let scenario_a_after_p50_and_p99_genuinely_differ = after_p50 != after_p99;

    // ---- Scenario B: the after distribution genuinely improves the ----
    // ---- median while genuinely regressing the tail, on the identical ----
    // ---- change. ----
    let scenario_b_median_genuinely_improved = after_p50 < before_p50;
    let scenario_b_p99_genuinely_regressed = after_p99 > before_p99;

    // ---- Scenario C: the real average alone genuinely hides this ----
    // ---- divergence, since it moves with the median's own improvement ----
    // ---- rather than the tail's own regression. ----
    let scenario_c_average_genuinely_also_improved = after_avg < before_avg;
    let scenario_c_average_genuinely_disagrees_with_the_real_p99 = scenario_c_average_genuinely_also_improved && scenario_b_p99_genuinely_regressed;

    println!("before_p50 {}", before_p50);
    println!("before_p95 {}", before_p95);
    println!("before_p99 {}", before_p99);
    println!("after_p50 {}", after_p50);
    println!("after_p95 {}", after_p95);
    println!("after_p99 {}", after_p99);
    println!("before_avg {:.2}", before_avg);
    println!("after_avg {:.2}", after_avg);
    println!("scenario_a_before_p50_and_p99_genuinely_differ {}", scenario_a_before_p50_and_p99_genuinely_differ);
    println!("scenario_a_after_p50_and_p99_genuinely_differ {}", scenario_a_after_p50_and_p99_genuinely_differ);
    println!("scenario_b_median_genuinely_improved {}", scenario_b_median_genuinely_improved);
    println!("scenario_b_p99_genuinely_regressed {}", scenario_b_p99_genuinely_regressed);
    println!("scenario_c_average_genuinely_also_improved {}", scenario_c_average_genuinely_also_improved);
    println!(
        "scenario_c_average_genuinely_disagrees_with_the_real_p99 {}",
        scenario_c_average_genuinely_disagrees_with_the_real_p99
    );

    let a_p50_and_p99_are_genuinely_separate_statistics_of_the_identical_distribution =
        scenario_a_before_p50_and_p99_genuinely_differ && scenario_a_after_p50_and_p99_genuinely_differ;
    let b_the_after_distribution_genuinely_improves_the_median_while_genuinely_regressing_the_tail =
        scenario_b_median_genuinely_improved && scenario_b_p99_genuinely_regressed;
    let c_the_real_average_alone_genuinely_hides_the_real_tail_regression = scenario_c_average_genuinely_disagrees_with_the_real_p99;

    println!(
        "a_p50_and_p99_are_genuinely_separate_statistics_of_the_identical_distribution {}",
        a_p50_and_p99_are_genuinely_separate_statistics_of_the_identical_distribution
    );
    println!(
        "b_the_after_distribution_genuinely_improves_the_median_while_genuinely_regressing_the_tail {}",
        b_the_after_distribution_genuinely_improves_the_median_while_genuinely_regressing_the_tail
    );
    println!(
        "c_the_real_average_alone_genuinely_hides_the_real_tail_regression {}",
        c_the_real_average_alone_genuinely_hides_the_real_tail_regression
    );
}
