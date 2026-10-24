use std::future::Future;

#[trait_variant::make(Greeter: Send)]
trait LocalGreeter {
    async fn greet(self) -> String;
}

struct English;

impl Greeter for English {
    async fn greet(self) -> String {
        String::from("hello")
    }
}

fn multi_threaded_spawn<F: Future<Output = String> + Send + 'static>(f: F) -> std::thread::JoinHandle<String> {
    std::thread::spawn(move || futures_lite::future::block_on(f))
}

fn run<G: Greeter + Send + 'static>(g: G) -> String {
    multi_threaded_spawn(g.greet()).join().unwrap()
}

fn main() {
    let result = run(English);
    println!("{}", result);
}
