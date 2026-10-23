// An associated type is chosen once, inside the one impl of the trait for a given type (coherence
// allows only one impl of a trait per type at all). Codec here mirrors Iterator's Item.
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

fn main() {
    let a = A;
    let out: u8 = a.encode();
    println!("{}", out);
}
