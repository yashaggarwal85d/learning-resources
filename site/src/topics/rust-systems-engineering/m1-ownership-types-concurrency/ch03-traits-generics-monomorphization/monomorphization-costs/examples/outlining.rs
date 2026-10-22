// The non-generic-inner-function (outlining) trick: the bulk of the work moves into a
// plain, non-generic function compiled exactly once; the generic wrapper that gets
// monomorphized per type shrinks to almost nothing. Compiled with --emit=llvm-ir,
// `format_bytes` should appear as exactly one defined symbol while `encode` appears as
// two (one per concrete codec), and each `encode` body is tiny compared to a version
// that does the formatting work itself.
trait Codec {
    fn encode(&self) -> u8;
}

struct A;
impl Codec for A {
    fn encode(&self) -> u8 {
        1
    }
}

struct B;
impl Codec for B {
    fn encode(&self) -> u8 {
        2
    }
}

// Non-generic: takes only the already-extracted byte, so there is nothing left in its
// signature or body for the compiler to monomorphize. One copy, no matter how many
// codecs call it.
fn format_bytes(byte: u8) -> Vec<u8> {
    let mut out = Vec::with_capacity(8);
    for i in 0..8u8 {
        out.push(byte.wrapping_add(i));
    }
    out
}

// Generic, thin: the only type-dependent step is the trait call; everything else is
// handed off to the shared, non-generic body above.
pub fn encode<C: Codec>(c: &C) -> Vec<u8> {
    format_bytes(c.encode())
}

#[unsafe(no_mangle)]
pub extern "C" fn call_a(a: &A) -> u8 {
    encode(a).len() as u8
}

#[unsafe(no_mangle)]
pub extern "C" fn call_b(b: &B) -> u8 {
    encode(b).len() as u8
}

fn main() {
    println!("{} {}", call_a(&A), call_b(&B));
}
