use std::sync::Arc;

fn main() {
    let counter: Arc<u64> = Arc::new(0);
    let c2 = Arc::clone(&counter);
    *counter += 1;
    println!("{} {}", counter, c2);
}
