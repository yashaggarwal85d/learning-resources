// Box::leak mints a genuine &'static reference to data created at run time, by deliberately skipping
// its destructor (safe, per Chapter 1's leak-safety topic) -- the one case the bound is the right fix for.
fn make_static(n: u32) -> &'static u32 {
    Box::leak(Box::new(n))
}

fn main() {
    let r: &'static u32 = make_static(7);
    println!("{r}");
}
