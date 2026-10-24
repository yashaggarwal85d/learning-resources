const NUM_VALUES: usize = 10_000;
const LANES: usize = 8; // an AVX2 256-bit register holds eight i32 lanes

fn build_column(n: usize) -> Vec<i32> {
    // a self-contained, deterministic xorshift generator, so the column
    // is reproducible without an external crate.
    let mut state = 0x2545_F491_4F6C_DD1Du64;
    (0..n)
        .map(|_| {
            let mut x = state;
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            state = x;
            (x % 1_000) as i32
        })
        .collect()
}

// the scalar equivalent: one add per value, no explicit SIMD at all.
fn scalar_sum(data: &[i32]) -> i64 {
    let mut total = 0i64;
    for &v in data {
        total += v as i64;
    }
    total
}

#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "avx2")]
unsafe fn simd_sum_avx2(data: &[i32]) -> (i64, usize) {
    use std::arch::x86_64::*;
    let mut acc = _mm256_setzero_si256();
    let chunks = data.chunks_exact(LANES);
    let remainder = chunks.remainder();
    let mut vector_ops = 0usize;
    for chunk in chunks {
        let v = unsafe { _mm256_loadu_si256(chunk.as_ptr() as *const __m256i) };
        acc = _mm256_add_epi32(acc, v);
        vector_ops += 1;
    }
    let mut lanes = [0i32; LANES];
    unsafe { _mm256_storeu_si256(lanes.as_mut_ptr() as *mut __m256i, acc) };
    let mut total: i64 = lanes.iter().map(|&x| x as i64).sum();
    for &v in remainder {
        total += v as i64;
    }
    (total, vector_ops)
}

// runs the explicit SIMD kernel only once the real CPU is checked, at
// runtime, to actually support it; otherwise falls back to a clearly
// labeled scalar-only measurement rather than assuming the feature is
// present.
fn simd_sum(data: &[i32]) -> (i64, usize, bool) {
    #[cfg(target_arch = "x86_64")]
    {
        if is_x86_feature_detected!("avx2") {
            let (total, vector_ops) = unsafe { simd_sum_avx2(data) };
            return (total, vector_ops, true);
        }
    }
    // labeled scalar-only fallback: the explicit SIMD feature this
    // kernel needs is genuinely absent on this CPU.
    (scalar_sum(data), data.len(), false)
}

fn main() {
    let n = NUM_VALUES;
    let column = build_column(n);

    let scalar_result = scalar_sum(&column);
    let (simd_result, simd_ops, used_explicit_simd) = simd_sum(&column);

    let expected_vector_ops = n / LANES; // chunks_exact(LANES), remainder handled separately
    let scalar_ops = n;

    let a_simd_result_matches_scalar_exactly = scalar_result == simd_result;
    let b_explicit_simd_feature_was_genuinely_detected_at_runtime = used_explicit_simd;
    let c_simd_processes_far_fewer_vector_ops_than_scalar =
        used_explicit_simd && simd_ops * 4 < scalar_ops;
    let d_vector_op_count_matches_real_lane_arithmetic =
        !used_explicit_simd || simd_ops == expected_vector_ops;

    println!("scalar_result {scalar_result}");
    println!("simd_result {simd_result}");
    println!("scalar_ops {scalar_ops}");
    println!("simd_ops {simd_ops}");
    println!("expected_vector_ops {expected_vector_ops}");
    println!("used_explicit_simd {used_explicit_simd}");
    println!("a_simd_result_matches_scalar_exactly {a_simd_result_matches_scalar_exactly}");
    println!(
        "b_explicit_simd_feature_was_genuinely_detected_at_runtime {b_explicit_simd_feature_was_genuinely_detected_at_runtime}"
    );
    println!(
        "c_simd_processes_far_fewer_vector_ops_than_scalar {c_simd_processes_far_fewer_vector_ops_than_scalar}"
    );
    println!(
        "d_vector_op_count_matches_real_lane_arithmetic {d_vector_op_count_matches_real_lane_arithmetic}"
    );
}
