// A second impl of the same trait for the same type, picking a different associated Output, is not
// a second choice: it's a duplicate impl, and coherence rejects it outright, with or without an
// associated type involved.
trait Codec {
    type Output;
    fn encode(&self) -> Self::Output;
}

struct A;
impl Codec for A {
    type Output = u8;
    fn encode(&self) -> u8 {
        1
    }
}
impl Codec for A {
    type Output = u16;
    fn encode(&self) -> u16 {
        2
    }
}

fn main() {}
