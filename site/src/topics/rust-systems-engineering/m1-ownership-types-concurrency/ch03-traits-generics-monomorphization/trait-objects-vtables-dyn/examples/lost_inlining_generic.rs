// The generic version: the concrete type is known at compile time, so the optimizer can inline
// encode()'s trivial body straight into the loop, leaving no call instruction behind at all.
trait Codec {
    fn encode(&self) -> u8;
}

struct A;
impl Codec for A {
    fn encode(&self) -> u8 {
        1
    }
}

fn sum_impl<C: Codec>(c: &C, n: u32) -> u64 {
    let mut total: u64 = 0;
    for i in 0..n {
        total = total.wrapping_add(c.encode().wrapping_add(i as u8) as u64);
    }
    total
}

#[unsafe(no_mangle)]
pub extern "C" fn sum_generic(c: &A, n: u32) -> u64 {
    sum_impl(c, n)
}

fn main() {
    println!("{}", sum_generic(&A, 8));
}
