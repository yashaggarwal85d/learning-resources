const NUM_ROWS: usize = 10_000;
// a skewed/repetitive column's own run length: long stretches of the
// identical value, the way a real status or category column often looks.
const RUN_LENGTH: usize = 200;

#[derive(Clone)]
struct RleEncoded {
    runs: Vec<(i64, u32)>, // (value, run length)
}

fn rle_encode(column: &[i64]) -> RleEncoded {
    let mut runs = Vec::new();
    let mut i = 0;
    while i < column.len() {
        let v = column[i];
        let mut len = 1usize;
        while i + len < column.len() && column[i + len] == v {
            len += 1;
        }
        runs.push((v, len as u32));
        i += len;
    }
    RleEncoded { runs }
}

fn rle_decode(enc: &RleEncoded) -> Vec<i64> {
    let mut out = Vec::with_capacity(enc.runs.iter().map(|&(_, len)| len as usize).sum());
    for &(v, len) in &enc.runs {
        for _ in 0..len {
            out.push(v);
        }
    }
    out
}

fn rle_encoded_bytes(enc: &RleEncoded) -> usize {
    enc.runs.len() * (std::mem::size_of::<i64>() + std::mem::size_of::<u32>())
}

fn raw_bytes(column: &[i64]) -> usize {
    column.len() * std::mem::size_of::<i64>()
}

fn compression_ratio(raw: usize, encoded: usize) -> f64 {
    raw as f64 / encoded as f64
}

// a self-contained, deterministic xorshift generator, so the "uniformly
// random" column is reproducible without pulling in an external crate.
struct Xorshift64 {
    state: u64,
}

impl Xorshift64 {
    fn new(seed: u64) -> Self {
        Xorshift64 { state: seed }
    }

    fn next_u64(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        x
    }
}

fn build_skewed_column(n: usize, run_length: usize) -> Vec<i64> {
    (0..n).map(|i| (i / run_length) as i64).collect()
}

fn build_random_column(n: usize) -> Vec<i64> {
    let mut rng = Xorshift64::new(0x2545_F491_4F6C_DD1D);
    (0..n).map(|_| (rng.next_u64() % 1_000_000) as i64).collect()
}

fn main() {
    let n = NUM_ROWS;
    let skewed = build_skewed_column(n, RUN_LENGTH);
    let random = build_random_column(n);

    let skewed_encoded = rle_encode(&skewed);
    let random_encoded = rle_encode(&random);

    let skewed_decoded = rle_decode(&skewed_encoded);
    let random_decoded = rle_decode(&random_encoded);
    let skewed_round_trips = skewed_decoded == skewed;
    let random_round_trips = random_decoded == random;

    let raw = raw_bytes(&skewed); // identical length, so identical raw size
    let skewed_encoded_bytes = rle_encoded_bytes(&skewed_encoded);
    let random_encoded_bytes = rle_encoded_bytes(&random_encoded);

    let skewed_ratio = compression_ratio(raw, skewed_encoded_bytes);
    let random_ratio = compression_ratio(raw, random_encoded_bytes);

    // decode work, measured as run-headers processed per output value: a
    // real, deterministic proxy for decode cost, independent of wall-clock
    // timing noise.
    let skewed_runs = skewed_encoded.runs.len();
    let random_runs = random_encoded.runs.len();
    let skewed_runs_per_value = skewed_runs as f64 / n as f64;
    let random_runs_per_value = random_runs as f64 / n as f64;

    let a_rle_wins_big_on_skewed_data = skewed_ratio > 2.0;
    let b_rle_loses_on_uniformly_random_data = random_ratio < 1.0;
    let c_decode_work_per_value_is_data_distribution_dependent =
        skewed_runs_per_value < random_runs_per_value / 10.0;
    let d_both_encodings_round_trip_exactly = skewed_round_trips && random_round_trips;

    println!("raw_bytes {raw}");
    println!("skewed_encoded_bytes {skewed_encoded_bytes}");
    println!("random_encoded_bytes {random_encoded_bytes}");
    println!("skewed_ratio {skewed_ratio:.4}");
    println!("random_ratio {random_ratio:.4}");
    println!("skewed_runs {skewed_runs}");
    println!("random_runs {random_runs}");
    println!("skewed_runs_per_value {skewed_runs_per_value:.4}");
    println!("random_runs_per_value {random_runs_per_value:.4}");
    println!("a_rle_wins_big_on_skewed_data {a_rle_wins_big_on_skewed_data}");
    println!("b_rle_loses_on_uniformly_random_data {b_rle_loses_on_uniformly_random_data}");
    println!(
        "c_decode_work_per_value_is_data_distribution_dependent {c_decode_work_per_value_is_data_distribution_dependent}"
    );
    println!("d_both_encodings_round_trip_exactly {d_both_encodings_round_trip_exactly}");
}
