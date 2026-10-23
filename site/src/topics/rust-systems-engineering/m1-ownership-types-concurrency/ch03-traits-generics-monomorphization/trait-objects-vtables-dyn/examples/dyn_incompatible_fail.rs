// A method taking Self by value can't be dispatched through a trait object: the callee would need
// to know Self's concrete size through an opaque fat pointer, which it can't. Forming Box<dyn Greet>
// fails to compile for exactly that reason (the Reference's "dyn compatibility" rules).
trait Greet {
    fn loud(self) -> Self;
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
