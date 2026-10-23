// impl Trait in argument position is sugar for a trait-bounded generic parameter, but
// it is not fully equivalent: with `impl Trait` on two parameters, each may be a
// different concrete type; with one shared `<T: Trait>` on both, they must be the same
// concrete type. This compiles, pairing two different concrete greeters.
trait Greet {
    fn hi(&self) -> &'static str;
}

struct Dog;
impl Greet for Dog {
    fn hi(&self) -> &'static str {
        "woof"
    }
}

struct Cat;
impl Greet for Cat {
    fn hi(&self) -> &'static str {
        "meow"
    }
}

fn two_impl_trait(a: impl Greet, b: impl Greet) -> (&'static str, &'static str) {
    (a.hi(), b.hi())
}

fn main() {
    let (x, y) = two_impl_trait(Dog, Cat);
    println!("{x} {y}");
}
