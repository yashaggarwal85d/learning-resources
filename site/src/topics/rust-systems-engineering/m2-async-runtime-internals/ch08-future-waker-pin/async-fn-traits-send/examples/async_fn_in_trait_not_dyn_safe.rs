trait Greeter {
    async fn greet(&self);
}

struct English;

impl Greeter for English {
    async fn greet(&self) {
        println!("hello");
    }
}

fn make() -> Box<dyn Greeter> {
    Box::new(English)
}

fn main() {
    let _ = make();
}
