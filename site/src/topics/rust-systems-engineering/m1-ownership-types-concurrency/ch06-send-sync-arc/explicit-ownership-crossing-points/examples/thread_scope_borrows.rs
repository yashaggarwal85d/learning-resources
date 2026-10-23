// The identical borrow that thread::spawn refuses, now inside thread::scope.
// The scope's own guarantee (every spawned thread joins before scope returns)
// is what makes borrowing non-'static data sound, and the compiler accepts it.
use std::thread;

fn main() {
    let data = vec![10, 20, 30];
    let mut total = 0;
    thread::scope(|s| {
        s.spawn(|| {
            // borrows `data`, not moved — sound because the scope joins this
            // thread before it returns
            assert_eq!(data.len(), 3);
        });
        s.spawn(|| {
            total += data.iter().sum::<i32>();
        });
    });
    // After the scope returns, every spawned thread has already joined.
    println!("{}", total);
}
