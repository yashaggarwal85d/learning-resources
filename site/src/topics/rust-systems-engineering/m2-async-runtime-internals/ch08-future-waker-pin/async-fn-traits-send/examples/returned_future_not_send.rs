use std::future::Future;

trait Greeter {
    fn greet(&self) -> impl Future<Output = ()>;
}

fn multi_threaded_spawn<F: Future<Output = ()> + Send + 'static>(f: F) {
    std::thread::spawn(move || {
        let _ = f;
    });
}

fn run<G: Greeter + Send + 'static>(g: G) {
    multi_threaded_spawn(g.greet());
}

fn main() {}
