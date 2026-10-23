// The dyn version: the concrete type behind the trait object isn't known until run time, so the
// optimizer can never inline encode() away. Every call loads a function pointer from the vtable
// and invokes it indirectly (the Reference's own "late binding"), no matter how trivial the body is.
trait Codec {
    fn encode(&self) -> u8;
}

struct A;
impl Codec for A {
    fn encode(&self) -> u8 {
        1
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn sum_dyn(c: &dyn Codec, n: u32) -> u64 {
    let mut total: u64 = 0;
    for i in 0..n {
        total = total.wrapping_add(c.encode().wrapping_add(i as u8) as u64);
    }
    total
}

fn main() {
    let a = A;
    println!("{}", sum_dyn(&a, 8));
}
