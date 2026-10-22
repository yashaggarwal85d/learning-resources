// The same two greeters as impl_trait_arg.rs, but through one shared `<T: Greet>` on
// both parameters instead of two separate `impl Greet` parameters. A trait bound shared
// across parameters forces them to the same concrete type, so passing a Dog and a Cat
// here must fail to compile, unlike the impl-Trait version.
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

fn two_same_type<T: Greet>(a: T, b: T) -> (&'static str, &'static str) {
    (a.hi(), b.hi())
}

fn main() {
    let (x, y) = two_same_type(Dog, Cat);
    println!("{x} {y}");
}
