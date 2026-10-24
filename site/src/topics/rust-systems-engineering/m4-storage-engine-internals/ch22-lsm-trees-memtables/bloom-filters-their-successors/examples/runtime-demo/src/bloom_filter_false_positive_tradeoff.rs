// A real, minimal Bloom filter: a bit array and a chosen number of
// independent hash functions. A negative result is proof a key is
// absent; a positive result only grants permission to go look.

struct BloomFilter {
    bits: Vec<bool>,
    num_hashes: u32,
}

impl BloomFilter {
    fn new(num_bits: usize, num_hashes: u32) -> Self {
        BloomFilter { bits: vec![false; num_bits], num_hashes }
    }

    fn with_bits_per_key(num_keys: usize, bits_per_key: usize, num_hashes: u32) -> Self {
        BloomFilter::new(num_keys * bits_per_key, num_hashes)
    }

    fn hash_positions(&self, key: u32) -> Vec<usize> {
        let m = self.bits.len() as u64;
        (0..self.num_hashes)
            .map(|i| {
                // Two independent base hashes, combined per Kirsch-Mitzenmacher,
                // to stand in for several real, independent hash functions.
                let h1 = fold(key, 0x9E3779B9);
                let h2 = fold(key, 0x85EBCA77);
                ((h1.wrapping_add((i as u64).wrapping_mul(h2))) % m) as usize
            })
            .collect()
    }

    fn insert(&mut self, key: u32) {
        for pos in self.hash_positions(key) {
            self.bits[pos] = true;
        }
    }

    /// true means "maybe present" (permission to go look); false means
    /// "definitely absent" (proof, no lookup needed).
    fn might_contain(&self, key: u32) -> bool {
        self.hash_positions(key).iter().all(|&pos| self.bits[pos])
    }
}

fn fold(key: u32, seed: u64) -> u64 {
    let mut h: u64 = seed ^ 1469598103934665603;
    for b in key.to_be_bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(1099511628211);
    }
    h
}

/// Builds a filter over `num_keys` inserted keys at the given bits-per-key
/// budget, then measures: whether every inserted key is still found
/// (never a false negative), and the real false-positive rate against a
/// disjoint range of keys that were never inserted at all.
fn measure(num_keys: u32, bits_per_key: usize, num_hashes: u32) -> (bool, f64) {
    let mut filter = BloomFilter::with_bits_per_key(num_keys as usize, bits_per_key, num_hashes);
    for k in 0..num_keys {
        filter.insert(k);
    }

    let no_false_negatives = (0..num_keys).all(|k| filter.might_contain(k));

    let probe_start = num_keys * 10; // a disjoint range, never inserted
    let probe_count = num_keys * 10;
    let false_positives = (probe_start..probe_start + probe_count)
        .filter(|&k| filter.might_contain(k))
        .count();
    let false_positive_rate = false_positives as f64 / probe_count as f64;

    (no_false_negatives, false_positive_rate)
}

fn main() {
    const NUM_KEYS: u32 = 2000;
    const NUM_HASHES: u32 = 4;

    // ---- Claim A: every key actually inserted is always reported as
    // possibly present — zero false negatives, ever, at any budget. ----
    let (no_false_negatives_low, fp_rate_low) = measure(NUM_KEYS, 4, NUM_HASHES);
    let (no_false_negatives_high, fp_rate_high) = measure(NUM_KEYS, 12, NUM_HASHES);
    let a_zero_false_negatives_at_a_low_bits_per_key_budget = no_false_negatives_low;
    let a_zero_false_negatives_at_a_high_bits_per_key_budget = no_false_negatives_high;

    // ---- Claim B: false positives genuinely exist at a tight bits-per-
    // key budget — a positive result is not a guarantee. ----
    let b_false_positives_genuinely_exist_at_the_tight_budget = fp_rate_low > 0.0;

    // ---- Claim C: spending more bits per key genuinely lowers the real,
    // measured false-positive rate — the bits-per-key trade-off is real. ----
    let c_more_bits_per_key_genuinely_lowered_the_measured_false_positive_rate = fp_rate_high < fp_rate_low;

    println!("a_zero_false_negatives_at_a_low_bits_per_key_budget {}", a_zero_false_negatives_at_a_low_bits_per_key_budget);
    println!("a_zero_false_negatives_at_a_high_bits_per_key_budget {}", a_zero_false_negatives_at_a_high_bits_per_key_budget);
    println!("b_false_positives_genuinely_exist_at_the_tight_budget {}", b_false_positives_genuinely_exist_at_the_tight_budget);
    println!("c_more_bits_per_key_genuinely_lowered_the_measured_false_positive_rate {}", c_more_bits_per_key_genuinely_lowered_the_measured_false_positive_rate);
    println!("fp_rate_low {:.4}", fp_rate_low);
    println!("fp_rate_high {:.4}", fp_rate_high);
}
