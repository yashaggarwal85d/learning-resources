// A closed enum of known implementors, matched explicitly: no vtable, no fat pointer, at the cost
// of needing every variant known in advance (unlike Box<dyn Codec>).
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

enum CodecKind {
    A(A),
    B(B),
}
impl CodecKind {
    fn encode(&self) -> u8 {
        match self {
            CodecKind::A(a) => a.encode(),
            CodecKind::B(b) => b.encode(),
        }
    }
}

fn main() {
    let items = [CodecKind::A(A), CodecKind::B(B)];
    let sum: u8 = items.iter().map(|c| c.encode()).sum();
    println!("{}", sum);
}
