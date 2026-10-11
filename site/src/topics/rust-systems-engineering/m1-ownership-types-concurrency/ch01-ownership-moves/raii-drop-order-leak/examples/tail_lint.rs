#![warn(tail_expr_drop_order)]
#![allow(unused_variables)]

struct Loud(&'static str);
impl Drop for Loud {
    fn drop(&mut self) {
        println!("drop {}", self.0);
    }
}
impl Loud {
    fn len(&self) -> usize {
        0
    }
}

fn f() -> usize {
    let local = Loud("local");
    Loud("tail").len()
}

fn main() {
    println!("{}", f());
}
