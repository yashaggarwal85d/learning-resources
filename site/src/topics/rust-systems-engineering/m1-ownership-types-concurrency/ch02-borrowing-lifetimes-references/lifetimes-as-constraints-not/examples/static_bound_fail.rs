// T: 'static means "T contains no non-static references", not "a value of T lives forever": owned data
// (no borrows inside it) always satisfies the bound, a borrow of local data generally doesn't.
use std::fmt::Debug;

fn print_it(input: impl Debug + 'static) {
    println!("{input:?}");
}

fn main() {
    let i = 5;
    print_it(i);
    print_it(&i);
}
