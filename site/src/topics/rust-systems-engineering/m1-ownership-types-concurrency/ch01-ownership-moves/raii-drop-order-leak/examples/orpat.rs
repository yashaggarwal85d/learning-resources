fn main() {
    struct PrintOnDrop(&'static str);
    impl Drop for PrintOnDrop {
        fn drop(&mut self) {
            println!("drop({})", self.0);
        }
    }
    // Drops `x` before `y`.
    fn or_pattern_drop_order<T>(
        (Ok([x, y]) | Err([y, x])): Result<[T; 2], [T; 2]>
    ) {}

    or_pattern_drop_order(Ok([
        PrintOnDrop("Declared first, dropped last"),
        PrintOnDrop("Declared last, dropped first"),
    ]));
    or_pattern_drop_order(Err([
        PrintOnDrop("Declared last, dropped first"),
        PrintOnDrop("Declared first, dropped last"),
    ]));
    // Our own extra case, not the Reference's:
    let ((a, b, 1) | (b, a, 2)) = (PrintOnDrop("a"), PrintOnDrop("b"), 2) else {
        return;
    };
}
