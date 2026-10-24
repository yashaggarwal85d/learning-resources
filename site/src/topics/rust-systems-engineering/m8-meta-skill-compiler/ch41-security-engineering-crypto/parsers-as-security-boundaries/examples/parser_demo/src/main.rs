use std::panic;

const MAX_PAYLOAD: usize = 64;
const HEADER_LEN: usize = 5; // 1-byte tag + 4-byte little-endian length

fn encode(tag: u8, payload: &[u8]) -> Vec<u8> {
    let mut buf = Vec::with_capacity(HEADER_LEN + payload.len());
    buf.push(tag);
    buf.extend_from_slice(&(payload.len() as u32).to_le_bytes());
    buf.extend_from_slice(payload);
    buf
}

/// Reads the length field and slices with it directly, with no check
/// against the buffer's own real remaining length.
fn naive_parse(buf: &[u8]) -> &[u8] {
    let len = u32::from_le_bytes([buf[1], buf[2], buf[3], buf[4]]) as usize;
    let start = HEADER_LEN;
    &buf[start..start + len]
}

/// Validates the declared length against both the real remaining buffer
/// and a real, stated maximum before ever using it.
fn checked_parse(buf: &[u8]) -> Result<&[u8], String> {
    if buf.len() < HEADER_LEN {
        return Err("buffer shorter than the header".into());
    }
    let len = u32::from_le_bytes([buf[1], buf[2], buf[3], buf[4]]) as usize;
    if len > MAX_PAYLOAD {
        return Err(format!("declared length {len} exceeds the maximum payload size"));
    }
    let start = HEADER_LEN;
    let end = start
        .checked_add(len)
        .ok_or_else(|| "start + length overflowed".to_string())?;
    if end > buf.len() {
        return Err(format!("declared length {len} exceeds the real remaining buffer"));
    }
    Ok(&buf[start..end])
}

/// Adds two attacker-influenced lengths with no overflow check; in a
/// release build (overflow checks off by default) this silently wraps.
fn naive_total_size(header_len: u32, payload_len: u32) -> u32 {
    header_len + payload_len
}

/// The identical addition, checked.
fn checked_total_size(header_len: u32, payload_len: u32) -> Option<u32> {
    header_len.checked_add(payload_len)
}

fn main() {
    // Silence the default panic hook: the two scenarios below trigger a
    // real panic on purpose, caught with catch_unwind, and its own
    // default backtrace text would otherwise clutter this program's own
    // measured output.
    panic::set_hook(Box::new(|_| {}));

    // Scenario 1: a well-formed record. Both parsers must agree.
    let good = encode(1, b"hello");
    let naive_good = panic::catch_unwind(|| naive_parse(&good).to_vec());
    let checked_good = checked_parse(&good);
    println!("naive_good_ok={}", naive_good.is_ok());
    println!("checked_good_ok={}", checked_good.is_ok());
    if let (Ok(n), Ok(c)) = (&naive_good, &checked_good) {
        println!("both_match_good={}", n == c);
    }

    // Scenario 2: a record whose declared length claims far more bytes
    // than the buffer actually holds (a truncated/oversized attack).
    let mut oversized = encode(1, b"hi");
    // Overwrite the length field to claim 10,000 bytes while the real
    // buffer holds only two.
    oversized[1..5].copy_from_slice(&10_000u32.to_le_bytes());

    let naive_oversized = panic::catch_unwind(|| naive_parse(&oversized).to_vec());
    println!("naive_oversized_panicked={}", naive_oversized.is_err());

    let checked_oversized = checked_parse(&oversized);
    println!("checked_oversized_rejected={}", checked_oversized.is_err());

    // Scenario 3: a declared length that is well within the real buffer,
    // but still over this format's own stated maximum payload size.
    let over_policy_payload = vec![0u8; MAX_PAYLOAD + 1];
    let over_policy = encode(1, &over_policy_payload);

    let naive_over_policy = panic::catch_unwind(|| naive_parse(&over_policy).to_vec());
    println!("naive_over_policy_accepted={}", naive_over_policy.is_ok());

    let checked_over_policy = checked_parse(&over_policy);
    println!("checked_over_policy_rejected={}", checked_over_policy.is_err());

    // Scenario 4: two attacker-influenced lengths whose real sum genuinely
    // overflows a 32-bit addition.
    let header_len: u32 = u32::MAX - 10;
    let payload_len: u32 = 20;

    let naive_sum = naive_total_size(header_len, payload_len);
    let checked_sum = checked_total_size(header_len, payload_len);

    println!("naive_sum_wrapped_small={}", naive_sum < payload_len);
    println!("checked_sum_detected_overflow={}", checked_sum.is_none());
}
