// Two input lifetimes, no receiver: the compiler can't tell which one the output borrows from.
fn frob(s: &str, t: &str) -> &str {
    s
}
fn main() {}
