// The newtype pattern: wrap the foreign Vec<u8> in a local, single-field struct. Bytes is defined
// in this crate, so implementing the foreign Display trait for it satisfies the orphan rule.
use std::fmt;

struct Bytes(Vec<u8>);

impl fmt::Display for Bytes {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

fn main() {
    let b = Bytes(vec![1, 2, 3]);
    println!("{}", b);
}
