// The identical trait, fixed: adding `where Self: Sized` to the by-value method makes it explicitly
// non-dispatchable, excluding it from the vtable instead of blocking the trait object entirely.
// The rest of the trait stays dyn compatible and callable through Box<dyn Greet>.
trait Greet {
    fn loud(self) -> Self
    where
        Self: Sized;
    fn hi(&self) -> &'static str {
        "hi"
    }
}

struct Dog;
impl Greet for Dog {
    fn loud(self) -> Self {
        self
    }
}

fn main() {
    let d: Box<dyn Greet> = Box::new(Dog);
    println!("{}", d.hi());
}
