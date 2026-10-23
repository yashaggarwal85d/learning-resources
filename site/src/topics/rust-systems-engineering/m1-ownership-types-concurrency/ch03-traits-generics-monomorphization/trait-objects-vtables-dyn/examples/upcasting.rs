// Stable since 1.86: &dyn Sub coerces directly to &dyn Super, without going back through the
// concrete type that implemented both traits.
trait Super {
    fn s(&self) -> u8;
}
trait Sub: Super {
    fn sub(&self) -> u8;
}

struct X;
impl Super for X {
    fn s(&self) -> u8 {
        1
    }
}
impl Sub for X {
    fn sub(&self) -> u8 {
        2
    }
}

fn main() {
    let x = X;
    let sub_ref: &dyn Sub = &x;
    let super_ref: &dyn Super = sub_ref;
    println!("{} {}", sub_ref.sub(), super_ref.s());
}
