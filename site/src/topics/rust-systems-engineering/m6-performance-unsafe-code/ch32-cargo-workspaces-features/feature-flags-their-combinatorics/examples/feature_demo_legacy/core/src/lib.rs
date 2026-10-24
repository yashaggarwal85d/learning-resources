#[cfg(not(feature = "fast_mode"))]
pub fn plain_output() -> &'static str {
    "plain"
}

#[cfg(feature = "fast_mode")]
pub fn plain_output() -> &'static str {
    "fast"
}
