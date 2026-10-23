// One generic function, bound by a trait, called with two concrete codecs.
// Compiled with --emit=llvm-ir, this produces two distinct defined symbols for
// `encode_generic` (one per concrete type), proving monomorphization happens.
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

// inline(never) so the monomorphized body survives as its own symbol instead of being
// inlined away at the call site, which is what we need to see in the LLVM IR below.
#[inline(never)]
pub fn encode_generic<C: Codec>(c: &C) -> u8 {
    c.encode()
}

#[unsafe(no_mangle)]
pub extern "C" fn call_a(a: &A) -> u8 {
    encode_generic(a)
}

#[unsafe(no_mangle)]
pub extern "C" fn call_b(b: &B) -> u8 {
    encode_generic(b)
}

fn main() {
    println!("{} {}", call_a(&A), call_b(&B));
}
