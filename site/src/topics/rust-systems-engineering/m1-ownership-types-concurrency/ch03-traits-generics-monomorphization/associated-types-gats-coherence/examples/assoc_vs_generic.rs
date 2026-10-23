// Iterator picks its Item type once per impl (an associated type): one type can have only one
// Iterator impl. From<T> is generic over T instead: the same target type can have many From<T>
// impls, one per source type. Codec here mirrors Iterator: Output is chosen once per impl.
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

struct Meters(f64);
impl From<i32> for Meters {
    fn from(v: i32) -> Self {
        Meters(v as f64)
    }
}
impl From<f64> for Meters {
    fn from(v: f64) -> Self {
        Meters(v)
    }
}

fn main() {
    let a = A;
    let out: u8 = a.encode();
    let m1: Meters = Meters::from(3i32);
    let m2: Meters = Meters::from(3.5f64);
    println!("{} {} {}", out, m1.0, m2.0);
}
