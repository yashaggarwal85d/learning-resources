fn fib(n: u64) -> u64 {
    if n < 2 { n } else { fib(n - 1) + fib(n - 2) }
}

fn main() {
    let mut total: u64 = 0;
    for i in 0..30 {
        total = total.wrapping_add(fib(i % 25));
    }
    println!("{total}");
}
