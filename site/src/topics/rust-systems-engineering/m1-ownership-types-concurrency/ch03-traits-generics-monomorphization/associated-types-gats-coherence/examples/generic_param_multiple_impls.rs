// A generic type parameter on the trait itself (like From<T>) makes CodecGeneric<u8> and
// CodecGeneric<u16> different traits as far as coherence is concerned, so the identical type A can
// implement both at once: many impls, one per parameter, exactly like From<i32> and From<f64>.
trait CodecGeneric<O> {
    fn encode(&self) -> O;
}

struct A;
impl CodecGeneric<u8> for A {
    fn encode(&self) -> u8 {
        1
    }
}
impl CodecGeneric<u16> for A {
    fn encode(&self) -> u16 {
        2
    }
}

fn main() {
    let a = A;
    let small: u8 = a.encode();
    let big: u16 = a.encode();
    println!("{} {}", small, big);
}
