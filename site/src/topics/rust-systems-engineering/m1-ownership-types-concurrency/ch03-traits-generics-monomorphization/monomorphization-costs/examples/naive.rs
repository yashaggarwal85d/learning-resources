// The same `encode` as outlining.rs, but without pulling the byte-formatting loop into
// its own non-generic function: the whole body, loop included, lives inside the generic
// function, so monomorphization duplicates all of it once per concrete codec instead of
// just a thin shim. Used to measure the IR-size difference against outlining.rs.
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

pub fn encode<C: Codec>(c: &C) -> Vec<u8> {
    let byte = c.encode();
    let mut out = Vec::with_capacity(8);
    for i in 0..8u8 {
        out.push(byte.wrapping_add(i));
    }
    out
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
