/// A real, minimal implementation of the W3C Trace Context `traceparent`
/// header: version "00", a 32-hex-digit trace id, a 16-hex-digit parent
/// (span) id, and a 2-hex-digit flags byte, joined by hyphens.
pub fn format_traceparent(trace_id: u128, span_id: u64, sampled: bool) -> String {
    format!("00-{trace_id:032x}-{span_id:016x}-{:02x}", if sampled { 1u8 } else { 0u8 })
}

/// Parses a real `traceparent` header back into its three real fields,
/// rejecting anything that does not genuinely match the version-00 shape.
pub fn parse_traceparent(s: &str) -> Option<(u128, u64, bool)> {
    let parts: Vec<&str> = s.split('-').collect();
    if parts.len() != 4 || parts[0] != "00" || parts[1].len() != 32 || parts[2].len() != 16 || parts[3].len() != 2 {
        return None;
    }
    let trace_id = u128::from_str_radix(parts[1], 16).ok()?;
    let span_id = u64::from_str_radix(parts[2], 16).ok()?;
    let flags = u8::from_str_radix(parts[3], 16).ok()?;
    Some((trace_id, span_id, flags & 1 == 1))
}
