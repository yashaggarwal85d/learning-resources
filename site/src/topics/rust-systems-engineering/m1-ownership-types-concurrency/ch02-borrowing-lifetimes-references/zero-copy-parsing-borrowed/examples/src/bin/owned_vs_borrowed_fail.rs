// Zero-copy only works when the buffer outlives the view into it. A function that allocates its
// own owned Vec<u8> and tries to hand back a &[u8] borrowing from it cannot compile: the Vec is
// dropped at the end of this function, so the borrow would dangle.
fn make_and_borrow<'a>() -> &'a [u8] {
    let owned: Vec<u8> = vec![1, 2, 3];
    &owned[..]
}

fn main() {
    let view = make_and_borrow();
    println!("{:?}", view);
}
