// Calling an async fn produces a future value and runs none of its body — exactly topic 24's
// laziness claim. That means a future's size can be measured without ever polling it: it is
// determined entirely by what the compiler's generated suspension-state enum has to hold across
// its one await point. A future that holds nothing but a unit-returning await is tiny; a future
// that keeps a sizeable local alive across the identical await point is exactly that much larger
// — a real, measured stack-and-memcpy cost, not a described one.
use std::future::ready;
use std::mem::size_of_val;

async fn small_future() {
    ready(()).await;
}

async fn large_future() {
    let buf = [0u8; 4096];
    ready(()).await;
    std::hint::black_box(&buf);
}

fn main() {
    let small = small_future();
    let large = large_future();
    println!("{} {}", size_of_val(&small), size_of_val(&large));
}
