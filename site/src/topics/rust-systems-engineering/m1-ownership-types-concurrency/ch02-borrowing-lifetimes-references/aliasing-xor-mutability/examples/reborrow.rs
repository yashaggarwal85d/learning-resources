// A reborrow: `r` is lent to bump() and comes back usable, twice, because each call takes a shorter borrow
// carved from `r` (an implicit `&mut *r` at the call site) rather than moving `r` itself.
fn bump(x: &mut i32) {
    *x += 1;
}

fn main() {
    let mut n = 0;
    let r: &mut i32 = &mut n;
    bump(r);
    bump(r);
    println!("{r}");
}
